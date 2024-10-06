"use client";

import { useContainer } from "@/providers/ContainerProvider";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { execContainer } from "@/actions/ExecContainer";
import { socketManager } from "@/lib/socket/socket";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";

export function ExecuteCommands() {
  const { containerName } = useContainer();
  const terminalRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const xtermRef = useRef<Terminal | null>(null);

  const [retry, setRetry] = useState<boolean>(false);

  useEffect(() => {
    if (containerName.trim() === "") {
      return;
    }

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    const socket = socketManager.connect(containerName, false);
    socketRef.current = socket;
    xtermRef.current = term;

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    term.onData((data) => {
      socket.emit("input", data);
    });

    socket.on("output", (data) => {
      term.write(data);
    });

    const handleResize = () => {
      fitAddon.fit();
      socket.emit("resize", {
        cols: term.cols,
        rows: term.rows,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    // Cleanup
    return () => {
      term.dispose();
      socket.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [containerName]);

  if (containerName.trim() === "") {
    return <div>No container name</div>;
  }

  const handleSubmit = async (formData: FormData) => {
    const res: ReponseType<{ containerName: string }> = await execContainer(
      formData
    );
    console.log(res);
  };

  return (
    <div>
      <form action={handleSubmit}>
        <div className="flex gap-2">
          <Input type="text" name="command" placeholder="Enter command" />
          <Input type="hidden" name="containerName" value={containerName} />
          <Button type="submit">Execute</Button>
        </div>
      </form>
      <Button onClick={() => setRetry(!retry)}>Retry</Button>
      <div className="h-[600px] w-full bg-black p-2">
        <div ref={terminalRef} className="h-full" />
      </div>
    </div>
  );
}
