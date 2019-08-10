import { Injectable } from '@angular/core';
import { Config, STYLE, THEME } from 'ngx-easy-table';

@Injectable()
export class ConfigService {
  public static config: Config = {
    searchEnabled: false,
    headerEnabled: true,
    orderEnabled: false,
    paginationEnabled: false,
    exportEnabled: false,
    clickEvent: false,
    selectRow: false,
    selectCol: false,
    selectCell: false,
    rows: 15,
    additionalActions: false,
    serverPagination: false,
    isLoading: false,
    detailsTemplate: false,
    groupRows: false,
    paginationRangeEnabled: false,
    collapseAllRows: false,
    checkboxes: false,
    resizeColumn: false,
    fixedColumnWidth: true,
    horizontalScroll: false,
    draggable: false,
    logger: false,
    showDetailsArrow: false,
    showContextMenu: false,
    persistState: false,
    tableLayout: {
      style: STYLE.NORMAL,
      theme: THEME.LIGHT,
      borderless: false,
      hover: true,
      striped: true,
    },
  };
}
