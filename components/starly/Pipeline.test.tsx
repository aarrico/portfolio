import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pipeline } from "./Pipeline";

beforeEach(() => {
  // Force the reduced-motion path: deterministic, no rAF.
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

describe("Pipeline (reduced motion)", () => {
  it("renders the diagram and controls", () => {
    render(<Pipeline />);
    expect(
      screen.getByRole("img", { name: /starly pipeline simulation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send events/i }),
    ).toBeInTheDocument();
  });

  it("acks a burst instantly", async () => {
    const user = userEvent.setup();
    render(<Pipeline />);
    await user.click(screen.getByRole("button", { name: /send events/i }));
    const log = screen.getByRole("log");
    expect(log).toHaveTextContent(/acked/);
  });

  it("shows nack, DLQ, and redrive when ES is killed and revived", async () => {
    const user = userEvent.setup();
    render(<Pipeline />);
    await user.click(
      screen.getByRole("button", { name: /kill elasticsearch/i }),
    );
    await user.click(screen.getByRole("button", { name: /send events/i }));
    const log = screen.getByRole("log");
    expect(log).toHaveTextContent(/moved to DLQ/);

    await user.click(
      screen.getByRole("button", { name: /revive elasticsearch/i }),
    );
    await user.click(screen.getByRole("button", { name: /redrive dlq/i }));
    expect(log).toHaveTextContent(/redrive/i);
  });

  it("shows the Mongo fallback when Redis is down", async () => {
    const user = userEvent.setup();
    render(<Pipeline />);
    await user.click(screen.getByRole("button", { name: /kill redis/i }));
    await user.click(screen.getByRole("button", { name: /realtime stats/i }));
    expect(screen.getByRole("log")).toHaveTextContent(/recomputed from Mongo/);
  });
});

describe("Pipeline (reduced motion) — MongoDB outage", () => {
  it("keeps accepting writes but dead-letters them while Mongo is down", async () => {
    const user = userEvent.setup();
    render(<Pipeline />);
    await user.click(screen.getByRole("button", { name: /kill mongodb/i }));
    await user.click(screen.getByRole("button", { name: /send events/i }));
    const log = screen.getByRole("log");
    expect(log).toHaveTextContent(/queued/);
    expect(log).toHaveTextContent(/mongo unavailable/);
    expect(log).toHaveTextContent(/moved to DLQ/);
  });

  it("serves realtime stats from the warm cache, then 503s once it expires", async () => {
    const user = userEvent.setup();
    render(<Pipeline />);
    const stats = screen.getByRole("button", { name: /realtime stats/i });

    await user.click(stats);
    expect(screen.getByRole("log")).toHaveTextContent(/served from Redis/);

    await user.click(screen.getByRole("button", { name: /kill mongodb/i }));
    await user.click(stats);
    expect(screen.getByRole("log")).toHaveTextContent(/cached snapshot/);

    // Age the cache past its TTL by running the pipeline for a while.
    await user.click(screen.getByRole("button", { name: /send events/i }));
    await user.click(stats);
    expect(screen.getByRole("log")).toHaveTextContent(/storage_unavailable/);
  });
});
