import { formatNumber } from "@/lib/utils";
import type { DepositingAccount } from "@/lib/xrp-scan";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";

type Row = DepositingAccount;

type DepositerTableProps = {
  rows: Row[];
};

export const DepositerTable = ({ rows }: DepositerTableProps) => {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Depositer Accounts</CardTitle>
        <CardDescription>Wallet addresses that have been deposited to.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="table-cell text-right">Currency</TableHead>
              <TableHead className="table-cell text-right">Value</TableHead>
              <TableHead className="hidden text-right md:table-cell">Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.account}>
                <TableCell>
                  {row.account_name ? <div className="font-medium">{row.account_name}</div> : null}
                  <div className="text-sm text-muted-foreground">{row.account}</div>
                  {row.destination_tag ? (
                    <div className="text-sm text-orange-300">Destination Tag: {row.destination_tag}</div>
                  ) : null}
                </TableCell>
                <TableCell className="table-cell text-right">{row.currency}</TableCell>
                <TableCell className="table-cell text-right">{formatNumber(row.value)}</TableCell>
                <TableCell className="hidden text-right md:table-cell">{row.frequency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
