"use client";

import { useContainer } from "@/providers/ContainerProvider";
import { useEffect, useRef, useState } from "react";
import { BrowserSimulator } from "@/components/ui/browser-tab";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// import { Input } from "@/components/ui/input";
import { execContainer } from "@/actions/ExecContainer";
import { socketManager } from "@/lib/socket/socket";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";

export function ExecuteCommands() {
  const { containerName } = useContainer();
  const terminalRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const xtermRef = useRef<Terminal | null>(null);

  const [reload, setReload] = useState(false);

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
        cursor: "#ffffff",
      },
      fontFamily: '"Cascadia Code", Menlo, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      scrollback: 1000,
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
      term.scrollToBottom();
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

  if (containerName.trim() === "") {
    return null;
  }

  return (
    <div>
      <Button onClick={() => setReload(!reload)}>Reload</Button>
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen w-full"
      >
        <ResizablePanel defaultValue={50}>
          <pre>{containerName}</pre>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultValue={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultValue={80} className="relative">
              <BrowserSimulator
                url={`http://frontend-${containerName}.localhost`}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultValue={20} className="relative">
              <div ref={terminalRef} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
