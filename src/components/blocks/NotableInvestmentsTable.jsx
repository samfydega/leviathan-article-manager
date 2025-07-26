import React from "react";
import {
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import TableHeader from "./TableHeader";
import TableCell from "./TableCell";
import TableRow from "./TableRow";
import ReferenceLink from "./ReferenceLink";

export default function NotableInvestmentsTable({ title, rows }) {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <TableHeader icon={<Building2 size={14} />}>Company</TableHeader>
              <TableHeader icon={<Calendar size={14} />}>Year</TableHeader>
              <TableHeader icon={<TrendingUp size={14} />}>Round</TableHeader>
              <TableHeader icon={<DollarSign size={14} />}>
                Amount Invested
              </TableHeader>
              <TableHeader icon={<ExternalLinkIcon size={14} />}>
                Outcome
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={rowIndex % 2 === 1 ? "bg-gray-50" : ""}
              >
                <TableCell>
                  {row.company_name}
                  {row.citations && row.citations.length > 0 && (
                    <span className="ml-1">
                      {row.citations.map((citation, citationIndex) => (
                        <ReferenceLink
                          key={citationIndex}
                          href={`#ref${citation.id}`}
                          number={citation.id}
                        />
                      ))}
                    </span>
                  )}
                </TableCell>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.round}</TableCell>
                <TableCell>{row.amount_invested}</TableCell>
                <TableCell>{row.outcome}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
