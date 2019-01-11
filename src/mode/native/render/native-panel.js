import {
  getGutter,
  getComplitableStyle,
  insertChildrenIntoSlot,
  isIos
} from 'shared/util';

export function getPanelData(context) {
  // scrollPanel data start
  const data = {
    ref: 'scrollPanel',
    style: {},
    class: [],
    nativeOn: {
      '&scroll': context.handleScroll
    },
    props: {
      ops: context.mergedOptions.scrollPanel
    }
  };
  data.class.push('__native');
  const { scrollingY, scrollingX } = context.mergedOptions.scrollPanel;
  // dynamic set overflow scroll
  // feat: #11
  if (scrollingY) {
    data.style['overflowY'] = context.bar.vBar.state.size ? 'scroll' : '';
  } else {
    data.style['overflowY'] = 'hidden';
  }

  if (scrollingX) {
    data.style['overflowX'] = context.bar.hBar.state.size ? 'scroll' : '';
  } else {
    data.style['overflowX'] = 'hidden';
  }

  let gutter = getGutter();
  /* istanbul ignore if */
  if (!gutter) {
    data.class.push('__hidebar');
    if (isIos()) {
      data.class.push('__ios');
      data.class.push('__hide-ios-bar');
    }
  } else {
    // hide system bar by use a negative value px
    // gutter should be 0 when manually disable scrollingX #14
    if (
      context.bar.vBar.state.size &&
      context.mergedOptions.scrollPanel.scrollingY
    ) {
      if (context.mergedOptions.scrollPanel.verticalNativeBarPos == 'right') {
        data.style.marginRight = `-${gutter}px`;
      } /* istanbul ignore next */ else {
        data.style.marginLeft = `-${gutter}px`;
      }
    }
    if (
      context.bar.hBar.state.size &&
      context.mergedOptions.scrollPanel.scrollingX
    ) {
      data.style.height = `calc(100% + ${gutter}px)`;
    }
  }

  if (context.mergedOptions.vuescroll.enableVirtual) {
    if (!context.hasCalculatedVirtualDomSizeAndPos) {
      data.class.push('__calculating-size');
    } else {
      data.class.push('__virtual');
    }
  }

  // clear legency styles of slide mode...
  data.style.transformOrigin = '';
  data.style.transform = '';

  return data;
}

/**
 * create a scrollPanel
 *
 * @param {any} size
 * @param {any} context
 * @returns
 */
export function createPanel(h, context) {
  let data = {};

  data = getPanelData(context);

  return <scrollPanel {...data}>{getPanelChildren(h, context)}</scrollPanel>;
}

export function getPanelChildren(h, context) {
  let viewStyle = {};
  const data = {
    style: viewStyle,
    ref: 'scrollContent',
    class: '__view'
  };
  const _customContent = context.$slots['scroll-content'];

  if (context.mergedOptions.scrollPanel.scrollingX) {
    viewStyle.width = getComplitableStyle('width', 'fit-content');
  } else {
    data.style['width'] = '100%';
  }

  if (context.mergedOptions.scrollPanel.padding) {
    data.style.paddingRight = context.mergedOptions.rail.size;
  }

  if (
    context.mergedOptions.vuescroll.enableVirtual &&
    context.hasCalculatedVirtualDomSizeAndPos
  ) {
    viewStyle.height = context.vuescroll.state.virtualHeight + 'px';
    viewStyle.width = context.vuescroll.state.virtualWidth + 'px';
  }

  const children = virtualDomFilter.call(context, context.$slots.default);

  if (_customContent) {
    return insertChildrenIntoSlot(h, _customContent, children, data);
  }

  return <div {...data}>{children}</div>;
}

function virtualDomFilter(slots) {
  const currentDom = this.vuescroll.state.currentViewDom;
  if (
    !this.mergedOptions.vuescroll.enableVirtual ||
    !currentDom.length ||
    !this.hasCalculatedVirtualDomSizeAndPos
  ) {
    return slots;
  }

  // filtered dom which we will whow currently
  const filterdDom = currentDom.map(index => {
    const slot = slots[index];
    const metaDatum = this.groupManager.getCellMetadata(index);
    const style = (slot.data.style = slot.data.style || {});
    style.left = metaDatum.x;
    style.top = metaDatum.y;

    return slot;
  });

  return filterdDom;
}
