/**
 * copy from https://github.com/starkwang/vue-virtual-collection
 */

import SectionManager from './SectionManager';

/** Represents a group of logically-related items */
export default class GroupManager {
  constructor(group, sectionSize) {
    this._sectionSize = sectionSize;
    this.updateGroup(group);
  }

  updateGroup(group) {
    const sectionManager = new SectionManager(this._sectionSize);

    group.forEach((item) => {
      const { index, ...cellMetadatum } = item;
      sectionManager.registerCell({
        index,
        cellMetadatum
      });
    });

    sectionManager.freezeCells();

    this._group = group;
    this._sectionManager = sectionManager;
  }

  getCellIndices(region) {
    return this._sectionManager.getCellIndices(region);
  }

  getCellMetadata(index) {
    return this._sectionManager.getCellMetadata(index);
  }
}
