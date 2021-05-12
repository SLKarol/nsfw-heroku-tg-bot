import React from "react";

/**
 * Функция-обработчик нажатия на HTMLElement
 */
export type ClickHandler = (
  event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
) => void;

/**
 * Изменить текст в инпуте
 */
export type OnChange = (
  event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
) => void;

/**
 * Изменить состояние чекбокса
 */
export type OnCheck = (
  event: React.ChangeEvent<HTMLInputElement>,
  checked: boolean
) => void;

export type EmptyFunction = () => void;

export type onChangeSelectValue = (
  event: React.ChangeEvent<{
    name?: string | undefined;
    value: unknown;
  }>,
  child?: React.ReactNode
) => void;

export type onChangeCheck = (
  event: React.ChangeEvent<{
    name?: string | undefined;
    checked: boolean;
  }>,
  child?: React.ReactNode
) => void;

export type EmptyHandler = () => void;
