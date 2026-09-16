import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Simulation } from "@/lib/advection-diffusion/wasm";
import { Playground } from "./Playground";

vi.mock("@/lib/advection-diffusion/wasm", () => ({
  Simulation: { create: vi.fn() },
}));
vi.mock("./Scene", () => ({
  Scene: ({ snapshot }: { snapshot: { t: number } }) => (
    <output aria-label="Simulation time">{snapshot.t}</output>
  ),
}));
vi.mock("./Curve", () => ({ Curve: () => null }));

let frames: Map<number, FrameRequestCallback>;
let now: number;
let intersect: IntersectionObserverCallback;
let hidden: boolean;

function simulation() {
  return {
    time: 0,
    x: new Float64Array([0, 1]),
    u: new Float64Array([1, 0]),
    step: vi.fn(function (this: { time: number }) {
      this.time++;
    }),
    dispose: vi.fn(),
  };
}

async function frame(delta = 1000 / 60) {
  await act(async () => {
    now += delta;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
  });
}

beforeEach(() => {
  frames = new Map();
  now = 0;
  hidden = false;
  let id = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (key: number) => frames.delete(key));
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.mocked(Simulation.create).mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mount() {
  const sim = simulation();
  vi.mocked(Simulation.create).mockResolvedValue(sim as unknown as Simulation);
  const view = render(<Playground mode="interactive" />);
  await screen.findByLabelText("Simulation time");
  return { sim, ...view };
}

describe("Playground lifecycle", () => {
  it("pauses and resumes the same allocation and concentration state", async () => {
    const { sim, unmount } = await mount();
    await frame();
    expect(sim.time).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await frame(1000);
    expect(sim.time).toBe(1);
    expect(sim.dispose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    await frame();
    expect(sim.time).toBe(2);
    expect(Simulation.create).toHaveBeenCalledOnce();
    unmount();
    expect(sim.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });

  it.each([60, 144])("advances 60 ticks per second at %i Hz", async (hz) => {
    const { sim } = await mount();
    for (let i = 0; i < hz; i++) await frame(1000 / hz);
    expect(sim.time).toBe(60);
  });

  it("bounds catch-up after a stalled frame", async () => {
    const { sim } = await mount();
    await frame(10_000);
    expect(sim.time).toBe(5);
  });

  it("suspends hidden and offscreen simulations without resetting", async () => {
    const { sim } = await mount();
    await frame();
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    await frame(1000);
    expect(sim.time).toBe(1);
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    await frame();
    expect(sim.time).toBe(2);
    act(() =>
      intersect(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
    await frame(1000);
    expect(sim.time).toBe(2);
    expect(Simulation.create).toHaveBeenCalledOnce();
  });

  it("announces initialization failure and retries", async () => {
    const sim = simulation();
    vi.mocked(Simulation.create)
      .mockRejectedValueOnce(new Error("load failed"))
      .mockResolvedValueOnce(sim as unknown as Simulation);
    render(<Playground mode="interactive" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not load",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByLabelText("Simulation time");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await frame();
    expect(sim.time).toBe(1);
  });

  it("disposes an allocation that resolves after unmount", async () => {
    const sim = simulation();
    let resolve!: (value: Simulation) => void;
    vi.mocked(Simulation.create).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { unmount } = render(<Playground mode="interactive" />);
    unmount();
    await act(async () => resolve(sim as unknown as Simulation));
    expect(sim.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
});
