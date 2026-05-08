import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("shows validation errors when fields are invalid", async () => {
    const user = userEvent.setup();
    render(<ContactForm action={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(await screen.findByText(/name must be/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/message must be/i)).toBeInTheDocument();
  });

  it("calls the action with valid data", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({ ok: true });
    render(<ContactForm action={action} />);

    await user.type(screen.getByLabelText("Name"), "Alex Test");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(
      screen.getByLabelText("Message"),
      "This is a long enough test message.",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(action).toHaveBeenCalledOnce();
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });
});
