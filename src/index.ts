 /**
 * @desc 按钮类型可选值。
 * @typedef
 */
  export type MessageType = 'primary' | 'normal' | 'secondary' | undefined;

  /**
  * @desc 按钮的组件属性。
  * @typedef
  * @property {MessageType} [type] 按钮展示类型
  * @property {string} text 按钮文案
  * @property {function} [onClick] 按钮点击回调事件
  */
 export interface IMessageProps {
   type?: MessageType;
   text: string;
   onClick?: (e: Object) => void;
 }
 /**
 * @desc 合并按钮的属性。
 * @param {IMessageProps} props 当前传入的按钮属性值
 * @param {MessageType} messageType='normal' 按钮的默认属性
 * @param {boolean} [overwrite] 是否覆盖props已有值
 * @return {IMessageProps} 合并后最终按钮的属性值
 * 
 * @example
 * // 不覆盖的情况
 * mergeMessageProps({type: 'normal', text: 'hello'}, 'primary');
 * 
 * // 覆盖的情况
 * mergeMessageProps({type: 'normal', text: 'hello'}, 'primary', true);
 * 
 */
export function mergeMessageProps(props: IMessageProps, messageType: MessageType = 'normal', overflow?: boolean): IMessageProps {
  if (overflow) {
    return {
      ...props,
      type: messageType,
    };
  }
  return {
    type: messageType,
    ...props,
  };
}

/**
 * @desc 默认的国际化标识。
 */
 export const DEFAULT_LOCALE = 'zh-cn';

/**
 * @desc 学生信息，用于记录学生的姓名及年龄信息。
 */
 export class Student {
  /**
   * @desc 学生姓名
   * @type {string}
   */
  name: string;

  /**
   * @desc 学生年龄
   * @type {number}
   */
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  /**
   * @desc 返回问候语
   * @returns {string} 根据学生名字生成的问候语
   */
  getWelcomeString(): string {
    return `hello ${this.name}`;
  }
}