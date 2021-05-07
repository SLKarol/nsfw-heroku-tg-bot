export interface ContentRSS {
  /**
   * ID
   */
  id?: string;
  /**
   * content of history
   */
  content: string;
  /**
   * title history
   */
  title: string;
}

export interface BashOrgUI extends ContentRSS {
  id: string;
  selected: boolean;
}
