import { formatNumber } from "@/lib/utils";
import type { Asset } from "@/types/common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";

type Row = Asset;

interface AssetTableProps {
  rows: Row[];
}

export const AssetTable: React.FC<AssetTableProps> = ({ rows }) => {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Assets</CardTitle>
          <CardDescription>Other tokens</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.currency}>
                <TableCell>
                  <div className="font-medium">{row.currency}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">{row.issuer}</div>
                </TableCell>
                <TableCell className="text-right">{formatNumber(row.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
