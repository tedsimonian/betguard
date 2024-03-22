type CodeBlockProps = {
  content: string;
};

export const CodeBlock = ({ content }: CodeBlockProps) => {
  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div className="max-h-full overflow-y-scroll">
        <pre>
          <code id="code-block" className="whitespace-pre text-sm text-gray-500 dark:text-gray-400">
            {content}
          </code>
        </pre>
      </div>
    </div>
  );
};
