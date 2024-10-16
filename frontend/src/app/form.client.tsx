"use client";
import { Button } from "@/components/ui/button";
import { createContainer } from "@/actions/CreateContainer";
import { useContainer } from "@/providers/ContainerProvider";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

export function CreateContainerForm() {
  const { setContainerName, containerName } = useContainer();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const res: ReponseType<{ containerName: string }> = await createContainer();
    if (res.success) {
      console.log(res);
      setContainerName(res.responseObject.containerName);
    }
  };

  const handleConnect = () => {
    const value = inputRef.current?.value;
    if (value && value?.trim() !== "") {
      setContainerName(value);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 py-4">
      <form action={handleSubmit}>
        <Button type="submit">Create Container</Button>
        <pre>{containerName}</pre>
      </form>
      <div className="flex gap-2">
        <Input type="text" name="containerName" ref={inputRef} />
        <Button onClick={handleConnect}>Connect</Button>
      </div>
    </div>
  );
}
