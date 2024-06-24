import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

const DEBOUNCE_TIME_IN_MS = 2000;

type CopyToClipboardButtonProps = {
  textToCopy: string;
};

export const CopyToClipboardButton = ({ textToCopy }: CopyToClipboardButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), DEBOUNCE_TIME_IN_MS); // Reset after 2s
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const iconVariants = {
    copied: { scale: 1.2 },
    notCopied: { scale: 1 },
  };

  return (
    <Button onClick={handleCopy} size="sm" variant="ghost">
      <motion.div animate={isCopied ? "copied" : "notCopied"} variants={iconVariants} transition={{ duration: 0.2 }}>
        {isCopied ? <Check /> : <Copy />}
      </motion.div>
    </Button>
  );
};
