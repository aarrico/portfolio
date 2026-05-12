import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Controls } from "./Controls";

describe("Controls", () => {
  it("renders weather + math label per preset and fires onPresetChange", async () => {
    const onPresetChange = vi.fn();
    render(
      <Controls
        activePreset="breezy"
        v={1.0}
        D={0.5}
        playing={true}
        onPresetChange={onPresetChange}
        onVChange={vi.fn()}
        onDChange={vi.fn()}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onRelease={vi.fn()}
      />,
    );
    expect(screen.getByText("Calm day")).toBeInTheDocument();
    expect(screen.getByText("Diffusion only")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /windy/i }));
    expect(onPresetChange).toHaveBeenCalledWith("windy");
  });

  it("fires onVChange when wind slider moves", () => {
    const onVChange = vi.fn();
    render(
      <Controls
        activePreset="breezy"
        v={1.0}
        D={0.5}
        playing={true}
        onPresetChange={vi.fn()}
        onVChange={onVChange}
        onDChange={vi.fn()}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onRelease={vi.fn()}
      />,
    );
    const slider = screen.getByLabelText(/wind speed/i) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "2.0" } });
    expect(onVChange).toHaveBeenCalledWith(2.0);
  });
});
