/**
 * Type definitions for Notion API responses
 * Used to replace 'any' types throughout the codebase
 */

// Notion Rich Text types
export interface NotionRichText {
  type: 'text' | 'mention' | 'equation';
  text?: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  plain_text: string;
  href?: string | null;
}

// Notion Title property
export interface NotionTitleProperty {
  type: 'title';
  title: NotionRichText[];
}

// Notion Rich Text property
export interface NotionRichTextProperty {
  type: 'rich_text';
  rich_text: NotionRichText[];
}

// Notion Date property
export interface NotionDateProperty {
  type: 'date';
  date: {
    start: string;
    end?: string | null;
  } | null;
}

// Notion URL property
export interface NotionURLProperty {
  type: 'url';
  url: string | null;
}

// Notion Checkbox property
export interface NotionCheckboxProperty {
  type: 'checkbox';
  checkbox: boolean;
}

// Notion Select property
export interface NotionSelectProperty {
  type: 'select';
  select: {
    name: string;
  } | null;
}

// Notion Multi-select property
export interface NotionMultiSelectProperty {
  type: 'multi_select';
  multi_select: Array<{
    name: string;
  }>;
}

// Notion File property
export interface NotionFileProperty {
  type: 'files';
  files: Array<{
    name?: string;
    type: 'external' | 'file';
    external?: {
      url: string;
    };
    file?: {
      url: string;
    };
  }>;
}

// Union type for all Notion property types
export type NotionProperty = 
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionDateProperty
  | NotionURLProperty
  | NotionCheckboxProperty
  | NotionSelectProperty
  | NotionMultiSelectProperty
  | NotionFileProperty;

// Notion page properties object
export interface NotionPageProperties {
  [key: string]: NotionProperty;
}

// Notion page object (from database query)
export interface NotionPage {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: NotionPageProperties;
  url?: string;
}

// Notion block object
export interface NotionBlock {
  object: 'block';
  id: string;
  type: string;
  [key: string]: unknown; // Different block types have different structures
}

// Notion database query response
export interface NotionDatabaseQueryResponse {
  object: 'list';
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}

// Notion blocks list response
export interface NotionBlocksListResponse {
  object: 'list';
  results: NotionBlock[];
  next_cursor: string | null;
  has_more: boolean;
}

// Notion child page block
export interface NotionChildPageBlock extends NotionBlock {
  type: 'child_page';
  child_page: {
    title: string;
  };
}

// Notion paragraph block
export interface NotionParagraphBlock extends NotionBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: NotionRichText[];
    color?: string;
  };
}

// Notion heading blocks
export interface NotionHeadingBlock extends NotionBlock {
  type: 'heading_1' | 'heading_2' | 'heading_3';
  [key: string]: {
    rich_text: NotionRichText[];
    color?: string;
  } | unknown;
}

// Notion code block
export interface NotionCodeBlock extends NotionBlock {
  type: 'code';
  code: {
    rich_text: NotionRichText[];
    language?: string;
  };
}

// Notion image block
export interface NotionImageBlock extends NotionBlock {
  type: 'image';
  image: {
    type: 'external' | 'file';
    external?: {
      url: string;
    };
    file?: {
      url: string;
    };
    caption?: NotionRichText[];
  };
}
