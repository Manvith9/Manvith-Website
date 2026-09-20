import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function ls(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();

  const docs = {
    name: "ls",
    short: "list directory contents",
    long: "",
  };

  /*
   * Custom display order for the portfolio terminal.
   *
   * This changes only how `ls` displays entries.
   * It does NOT rename or move anything in the virtual filesystem.
   */
  const homeOrder = [
    "about",
    "projects",
    "experience",
    "contact",
  ];

  const projectOrder = [
    "multi-agent.md",
    "document-ai.md",
    "diabetes.md",
    "collaboration.md",
    "url-shortener.md",
    "chat.md",
    "votesecure.md",
    "linux-driver.md",
    "stm32-monitor.md",
    "esp32-home.md",
    "traffic-controller.md",
  ];

  function getCurrentPath(): string {
    return path.p
      .map((item) => item.name)
      .filter((name) => name !== "/")
      .join("/");
  }

  function sortByOrder<T extends { name: string }>(
    files: T[],
    order: string[]
  ): T[] {
    return [...files].sort((a, b) => {
      const aIndex = order.indexOf(a.name);
      const bIndex = order.indexOf(b.name);

      /*
       * Entries not explicitly listed remain after our
       * portfolio entries instead of disappearing.
       */
      if (aIndex === -1 && bIndex === -1) {
        return a.name.localeCompare(b.name);
      }

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }

  const app = (args: string[], options: string[]) => {
    if (
      options.find(
        (o) => o === "-h" || o === "-help"
      )
    ) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    let out = "\n";

    const files = fileSystem.getChildren(path.p);

    const currentPath = getCurrentPath();

    let orderedFiles = [...files];

    if (currentPath === "home/user") {
      orderedFiles = sortByOrder(
        orderedFiles,
        homeOrder
      );
    }

    if (currentPath === "home/user/projects") {
      orderedFiles = sortByOrder(
        orderedFiles,
        projectOrder
      );
    }

    for (const f of orderedFiles) {
      out += `${f.name}\n`;
    }

    print(out);
  };

  return { docs, app };
}