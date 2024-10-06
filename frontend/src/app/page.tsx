import { CreateContainerForm } from "./form.client";
import { ExecuteCommands } from "./exec.client";
export default function Home() {
  return (
    <div>
      <CreateContainerForm />
      <ExecuteCommands />
    </div>
  );
}
