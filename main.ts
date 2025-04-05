import { Plugin, TFile, WorkspaceLeaf, MarkdownView } from 'obsidian';

export default class SplitViewOpener extends Plugin {
  private sourceLeaf: WorkspaceLeaf | null = null;
  private readingLeaf: WorkspaceLeaf | null = null;

  async onload() {
    console.log('Split View Opener loaded!');

    this.app.workspace.onLayoutReady(() => {
      // this.setupLeaves();

      this.registerEvent(
        this.app.workspace.on('file-open', (file: TFile | null) => {
          if (file && file.extension === 'md') {
            this.updateFileInBothLeaves(file);
          };
        })
      )
    });
  };

  setupLeaves() {
    const { workspace } = this.app;
    const mdLeaves = this.app.workspace.getLeavesOfType('markdown');
    const emptyLeaves = this.app.workspace.getLeavesOfType('empty');
    const leaves = [...mdLeaves, ...emptyLeaves];

    if (leaves.length >= 2) {
      this.sourceLeaf = leaves[0];
      this.readingLeaf = leaves[1];
    } else if (leaves.length === 1) {
      this.sourceLeaf = leaves[0];
      this.readingLeaf = workspace.createLeafBySplit(this.sourceLeaf, 'vertical');
    } else {
      this.sourceLeaf = workspace.getLeaf(false);
      this.readingLeaf = workspace.createLeafBySplit(this.sourceLeaf, 'vertical');
    };
  };

  async updateFileInBothLeaves(file: TFile) {
    console.log('Updating file in both leaves:', file.path);
    this.setupLeaves();

    if (!this.sourceLeaf || !this.readingLeaf) {
      return;
    };

    await this.sourceLeaf.openFile(file, { active: false });
    const sourceView = this.sourceLeaf.view as MarkdownView;
    await sourceView.setState({ mode: 'source' }, { history: true });

    await this.readingLeaf.openFile(file, { active: false });
    const readingView = this.readingLeaf.view as MarkdownView;
    await readingView.setState({ mode: 'preview' }, { history: true });
  }
};