import FileSystemBash, {
  FileBash,
  FileSystemType,
  FolderBash,
} from "../fileSystemBash";

export default function show(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();

  const docs = {
    name: "show",
    short: "render markdown (.md) files",
    long: "",
  };

  /*
   * Portfolio project metadata.
   *
   * The real files keep their .md names so the virtual filesystem,
   * show command, cat command, and tab completion continue to work.
   *
   * This metadata is only used to create a cleaner presentation.
   */
  const projectNumbers: Record<string, string> = {
    "multi-agent.md": "01",
    "document-ai.md": "02",
    "diabetes.md": "03",
    "collaboration.md": "04",
    "url-shortener.md": "05",
    "chat.md": "06",
    "votesecure.md": "07",
    "linux-driver.md": "08",
    "stm32-monitor.md": "09",
    "esp32-home.md": "10",
    "traffic-controller.md": "11",
  };

  function isInsideProjects(): boolean {
    return path.p.some(
      (entry) => entry.name === "projects"
    );
  }

  /*
   * Converts the normal project Markdown into a CRT-specific
   * presentation without changing the actual project content.
   */
  function formatProject(
    fileName: string,
    markdown: string
  ): string {
    const number = projectNumbers[fileName];

    if (!number) {
      return markdown;
    }

    const lines = markdown.split(/\r?\n/);

    /*
     * First line:
     *
     * ## *Multi-Agent Research Platform*
     *
     * becomes:
     *
     * ## *[01] MULTI-AGENT RESEARCH PLATFORM*
     */
    const titleIndex = lines.findIndex((line) =>
      /^##\s+/.test(line)
    );

    if (titleIndex !== -1) {
      const title = lines[titleIndex]
        .replace(/^##\s+/, "")
        .replace(/\*/g, "")
        .trim();

      lines[titleIndex] =
  `@@ [${number}] ${title.toUpperCase()}`;
    }

    /*
     * Section headings:
     *
     * ### Overview
     *
     * becomes:
     *
     * ### *> OVERVIEW*
     *
     * Technology lines beginning with • are left alone.
     */
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!/^###\s+/.test(line)) {
        continue;
      }

      const value = line
        .replace(/^###\s+/, "")
        .replace(/\*/g, "")
        .trim();

      /*
       * Don't transform the subtitle or technology rows.
       */
      if (
        value.startsWith("•") ||
        value.includes("·")
      ) {
        continue;
      }

      lines[i] =
  `### > ${value.toUpperCase()}`;
    }

    return lines.join("\n").trimStart();
  }

  const app = (
    args: string[],
    options: string[]
  ) => {
    if (
      options.find(
        (o) => o === "-h" || o === "-help"
      )
    ) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    if (
      options.find(
        (o) => o === "-a" || o === "-all"
      )
    ) {
      let allStr = "";

      const files = fileSystem.goHome().at(-1);

      if (!files) return;

      const showAll = (
        p: (FolderBash | FileBash)[]
      ) => {
        if (!p) return;

        p.forEach((e) => {
          if (e.name === "title") return;

          if (e.name === "projects") {
            allStr += "\n\n\n\n# Projects";
          }

          if (e.name.match(".md")) {
            allStr += (e as FileBash).data;
            return;
          }

          showAll((e as any).children);
        });
      };

      showAll(files.children);

      print(allStr, true);

      return;
    }

    if (args.length === 0) {
      print(`\nMissing filename`);
      return;
    }

    const file = fileSystem.goto(
      path.p,
      args[0]
    )?.at(-1);

    if (!file) {
      print(`\nNo such file or directory`);
      return;
    }

    if (!("data" in file)) {
      print(`\n${file.name}:not a file`);
      return;
    }

    /*
     * Project files get the refined portfolio presentation.
     * Everything else uses the original Markdown untouched.
     */
    if (
      isInsideProjects() &&
      file.name in projectNumbers
    ) {
      const formattedProject =
        formatProject(
          file.name,
          file.data
        );
        
      print(formattedProject, true);

      return;
    }

    print(file.data, true);
  };

  return {
    docs,
    app,
  };
}