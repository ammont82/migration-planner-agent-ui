import html2canvas from "html2canvas-pro";
import { afterEach, describe, expect, it, vi } from "vitest";
import { captureChartElement } from "../captureChartElement.js";

vi.mock("html2canvas-pro", () => ({
  default: vi.fn(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas;
  }),
}));

const mockedHtml2Canvas = vi.mocked(html2canvas);

afterEach(() => {
  mockedHtml2Canvas.mockClear();
  document.body.replaceChildren();
});

describe("captureChartElement", () => {
  it("temporarily unhides ancestors so a hidden tab panel can be measured", async () => {
    const panel = document.createElement("div");
    panel.hidden = true;
    const chart = document.createElement("div");
    panel.append(chart);
    document.body.append(panel);

    mockedHtml2Canvas.mockImplementation(async () => {
      expect(panel.hidden).toBe(false);
      expect(panel.style.display).toBe("block");
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    });

    await captureChartElement(chart);

    expect(panel.hidden).toBe(true);
  });

  it("temporarily unhides ancestors hidden with display none", async () => {
    const panel = document.createElement("div");
    panel.style.display = "none";
    const chart = document.createElement("div");
    panel.append(chart);
    document.body.append(panel);

    mockedHtml2Canvas.mockImplementation(async () => {
      expect(panel.style.display).toBe("block");
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    });

    await captureChartElement(chart);

    expect(panel.style.display).toBe("none");
  });

  it("keeps the card radius and paints a real border for the snapshot", async () => {
    const root = document.createElement("div");
    const card = document.createElement("div");
    card.className = "pf-v6-c-card";
    card.style.borderRadius = "16px";
    card.style.backgroundColor = "rgb(255, 255, 255)";
    card.style.border = "1px solid rgb(200, 200, 200)";
    root.append(card);
    document.body.append(root);

    mockedHtml2Canvas.mockImplementation(async (_element, options) => {
      expect(card.style.borderRadius).toBe("16px");
      expect(card.style.overflow).toBe("hidden");
      expect(card.style.backgroundColor).toBe("rgb(255, 255, 255)");

      const cloneRoot = document.createElement("div");
      const cloneCard = document.createElement("div");
      cloneCard.className = "pf-v6-c-card";
      cloneRoot.append(cloneCard);
      options?.onclone?.(document, cloneRoot);
      expect(cloneCard.style.borderRadius).toBe("16px");
      expect(cloneCard.style.overflow).toBe("hidden");

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    });

    await captureChartElement(root);

    expect(card.style.borderRadius).toBe("16px");
  });

  it("inlines computed card title padding so content stays inset", async () => {
    const root = document.createElement("div");
    const title = document.createElement("div");
    title.className = "pf-v6-c-card__title";
    title.style.padding = "24px 24px 16px 24px";
    root.append(title);
    document.body.append(root);

    mockedHtml2Canvas.mockImplementation(async (_element, options) => {
      expect(title.style.paddingTop).not.toBe("");
      expect(title.style.paddingLeft).not.toBe("");

      const cloneRoot = document.createElement("div");
      const cloneTitle = document.createElement("div");
      cloneTitle.className = "pf-v6-c-card__title";
      cloneRoot.append(cloneTitle);
      options?.onclone?.(document, cloneRoot);
      expect(cloneTitle.style.paddingTop).not.toBe("");
      expect(cloneTitle.style.paddingLeft).not.toBe("");

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    });

    await captureChartElement(root);
  });
});
