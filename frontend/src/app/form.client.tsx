"use client";
import { Button } from "@/components/ui/button";
import { createContainer } from "@/actions/CreateContainer";
import { useContainer } from "@/providers/ContainerProvider";

export function CreateContainerForm() {
  const { setContainerName, containerName } = useContainer();

  const handleSubmit = async () => {
    const res: ReponseType<{ containerName: string }> = await createContainer();
    if (res.success) {
      console.log(res);
      setContainerName(res.responseObject.containerName);
    }
  };

  return (
    <form action={handleSubmit}>
      <Button type="submit">Create Container</Button>
      <pre>{containerName}</pre>
    </form>
  );
}
