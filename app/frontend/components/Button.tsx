import type { ComponentPropsWithRef } from 'react';
import { forwardRef } from 'react';
import { Link } from 'remix';
import type { LinkProps } from 'remix';
import clsx from 'clsx';
import { Tooltip } from '@reach/tooltip';

export type ButtonClassNameProps = {
  isActive?: boolean;
  primary?: boolean;
  disabled?: boolean;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
};

export function buttonClassName({
  size = 'md',
  primary = false,
  full = false,
  isActive = false,
  disabled = false,
  className,
}: ButtonClassNameProps) {
  return clsx(
    'inline-flex items-center border shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75',
    {
      'border-transparent text-white': primary,
      'border-gray-300 text-gray-700': !primary,
      'bg-blue-700': primary && isActive,
      'bg-blue-600': primary && !isActive,
      'bg-gray-200': !primary && isActive,
      'bg-white': !primary && !isActive,
      'hover:bg-blue-700': primary && !isActive && !disabled,
      'hover:bg-gray-100': !primary && !isActive && !disabled,
      'text-xs rounded px-2.5 py-1.5': size == 'sm',
      'text-sm rounded-md px-3 py-2 leading-4': size == 'md',
      'text-sm rounded-md px-4 py-2': size == 'lg',
      'w-full flex justify-center': full,
    },
    className
  );
}

export type ButtonProps = ComponentPropsWithRef<'button'> &
  ButtonClassNameProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size,
      primary,
      full,
      className,
      isActive,
      type = 'button',
      label,
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        type={type}
        className={buttonClassName({
          size,
          primary,
          full,
          isActive,
          disabled: props.disabled,
          className,
        })}
        {...props}
      >
        {children}
      </button>
    );

    if (label) {
      return <Tooltip label={label}>{button}</Tooltip>;
    }
    return button;
  }
);
Button.displayName = 'Button';

export type LinkButtonProps = LinkProps & ButtonClassNameProps;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { children, size, primary, full, className, isActive, label, to, ...props },
    ref
  ) => {
    const link = (
      <Link
        ref={ref}
        to={to}
        className={buttonClassName({
          size,
          primary,
          full,
          isActive,
          disabled: props.disabled,
          className,
        })}
        {...props}
      >
        {children}
      </Link>
    );
    if (label) {
      return <Tooltip label={label}>{link}</Tooltip>;
    }
    return link;
  }
);

LinkButton.displayName = 'LinkButton';
