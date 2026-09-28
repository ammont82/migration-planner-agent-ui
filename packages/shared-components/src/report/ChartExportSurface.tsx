import { type FC, type ReactNode, useCallback } from "react";
import { flushSync } from "react-dom";
import {
  type ChartExportView,
  chartExportRootStyle,
  waitForChartExportPaint,
} from "./chartExport.js";
import { useRegisterChart } from "./chartExportContext.js";

export const ChartExportSurface: FC<{
  id: string;
  title: string;
  filename?: string;
  exportViews?: ChartExportView[];
  activeExportViewId?: string;
  onExportViewChange?: (viewId: string) => void;
  children: ReactNode;
}> = ({
  id,
  title,
  filename,
  exportViews,
  activeExportViewId,
  onExportViewChange,
  children,
}) => {
  const setExportView = useCallback(
    async (viewId: string) => {
      if (!onExportViewChange) {
        return;
      }
      flushSync(() => {
        onExportViewChange(viewId);
      });
      await waitForChartExportPaint();
    },
    [onExportViewChange],
  );

  const ref = useRegisterChart({
    id,
    title,
    filename,
    exportViews,
    activeExportViewId,
    setExportView:
      exportViews && exportViews.length > 1 && onExportViewChange
        ? setExportView
        : undefined,
  });
  return (
    <div ref={ref} style={chartExportRootStyle}>
      {children}
    </div>
  );
};

ChartExportSurface.displayName = "ChartExportSurface";
