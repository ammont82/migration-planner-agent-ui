import { type FC, type ReactNode, useCallback, useRef } from "react";
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
  const activeViewRef = useRef(activeExportViewId);
  activeViewRef.current = activeExportViewId;
  const onExportViewChangeRef = useRef(onExportViewChange);
  onExportViewChangeRef.current = onExportViewChange;

  const setExportView = useCallback(async (viewId: string) => {
    const change = onExportViewChangeRef.current;
    if (change && activeViewRef.current !== viewId) {
      change(viewId);
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }
    await waitForChartExportPaint();
  }, []);

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
