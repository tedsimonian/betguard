import { CopyToClipboardButton } from "@/components/ui/button/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

type InfoCardProps = {
  title: string;
  content: string;
  subscript?: string;
};

export const InfoCard = ({ title, content, subscript }: InfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CopyToClipboardButton textToCopy={content} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{content}</div>
        {subscript && <p className="text-xs text-muted-foreground">{subscript}</p>}
      </CardContent>
    </Card>
  );
};
