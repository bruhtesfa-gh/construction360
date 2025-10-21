export interface Options {
  optionId: string;
  description: string;
  version: string;
  totalCost: string;
  publishedPrice: string;
  comments: string;
}

export interface SubcategoryOptionsType {
  RegionID: string;
  OptionCategoryCode: string;
  Description: string;
  OptionSubCategoryCode: string;
  MarginPercentage: number;
  MarkupPercentage: number;
  RoundTo: number;
}
