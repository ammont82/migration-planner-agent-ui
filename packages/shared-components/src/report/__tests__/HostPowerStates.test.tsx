import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HostPowerStates } from "../HostPowerStates.js";
import { VmPowerStates } from "../VmPowerStates.js";

vi.mock("../../charts/MigrationDonutChart.js", () => ({
  MigrationDonutChart: ({
    title,
    subTitle,
  }: {
    title?: string;
    subTitle?: string;
  }): JSX.Element => (
    <div data-testid="power-donut">
      {title} {subTitle}
    </div>
  ),
}));

afterEach(() => cleanup());

describe("HostPowerStates", () => {
  it("renders the host power donut from inventory data", () => {
    render(<HostPowerStates hostPowerStates={{ green: 7 }} />);

    expect(screen.getByText("ESXi host power states")).toBeInTheDocument();
    expect(screen.getByTestId("power-donut")).toHaveTextContent("7 Hosts");
  });

  it("shows an empty state when host power data is missing", () => {
    render(<HostPowerStates hostPowerStates={{}} />);

    expect(
      screen.getByText("Host power state data not collected"),
    ).toBeInTheDocument();
  });
});

describe("VmPowerStates", () => {
  it("renders the VM power donut from inventory data", () => {
    render(<VmPowerStates powerStates={{ poweredOff: 297, poweredOn: 53 }} />);

    expect(screen.getByText("VM power states")).toBeInTheDocument();
    expect(screen.getByTestId("power-donut")).toHaveTextContent("350 VMs");
  });
});
