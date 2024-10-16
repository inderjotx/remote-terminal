import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "./input";

export function BrowserSimulator({ url }: { url: string }) {
  const [showIframe, setShowIframe] = useState(true);

  useEffect(() => {
    setShowIframe(false);
    const timeout = setTimeout(() => {
      setShowIframe(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [url]);

  const handleRefresh = () => {
    setShowIframe(false);
    setTimeout(() => {
      setShowIframe(true);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-2  absolute inset-0">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Input type="text" value={url} />
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {showIframe && (
        <iframe
          src={url}
          className="w-full h-full flex-1 "
          sandbox="allow-same-origin allow-scripts"
          title="Browser content"
        />
      )}
    </div>
  );
}
