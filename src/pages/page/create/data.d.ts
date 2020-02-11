export interface PropType {
  key: string;
  type: string;
  desc: string;
}

export interface ListItemDataType {
  id: number;
  nameCh: string;
  nameEn: string;
  image: string;
  description: string;
  props: PropType[];
}

export interface ResponseType {
  code: number;
  msg: string;
  data: any;
}
