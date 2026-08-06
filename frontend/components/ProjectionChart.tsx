"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { YearlyBalance } from "@/lib/api/goals";
import { formatCurrency } from "@/lib/format";

type ProjectionChartProps = {
  yearlyBalances: YearlyBalance[];
  targetAmount?: string | number;
  title?: string;
};

type ChartDatum = {
  year: number;
  balance: number;
};

function toChartData(yearlyBalances: YearlyBalance[]): ChartDatum[] {
  return yearlyBalances.map((entry) => ({
    year: entry.year,
    balance: Number(entry.balance)
  }));
}

export default function ProjectionChart({
  yearlyBalances,
  targetAmount,
  title = "Projected yearly balance"
}: ProjectionChartProps) {
  const chartData = toChartData(yearlyBalances);
  const target = targetAmount === undefined ? undefined : Number(targetAmount);
  const hasTarget = Number.isFinite(target);

  return (
    <section className="chart-panel" aria-label={title}>
      <div className="section-heading">
        <p className="eyebrow">Projection chart</p>
        <h2>{title}</h2>
      </div>
      <div className="chart-wrap" data-testid="projection-chart">
        <ResponsiveContainer height={280} width="100%">
          <LineChart data={chartData} margin={{ bottom: 8, left: 8, right: 24, top: 8 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{
                value: "Year",
                position: "insideBottom",
                offset: -4
              }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tickLine={false}
              width={92}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(toTooltipValue(value)), "Balance"]}
              labelFormatter={(label) => `Year ${String(label)}`}
            />
            {hasTarget ? (
              <ReferenceLine
                ifOverflow="extendDomain"
                label="Target"
                stroke="var(--warning)"
                strokeDasharray="4 4"
                y={target}
              />
            ) : null}
            <Line
              activeDot={{ r: 5 }}
              dataKey="balance"
              dot={{ r: 3 }}
              isAnimationActive={false}
              name="Projected balance"
              stroke="var(--primary)"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function toTooltipValue(value: unknown): string | number {
  return typeof value === "number" || typeof value === "string" ? value : 0;
}
