"use client";

import type { Options } from "@glidejs/glide";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import "@glidejs/glide/dist/css/glide.theme.min.css";
import type { ComponentProps, FC } from "react";
import { useEffect, useRef, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui/components/icon";
import { SkeletonText } from "@calcom/ui/components/skeleton";

const SliderButton: FC<ComponentProps<"button">> = (props) => {
  const { children, ...rest } = props;
  return (
    <button className="hover:bg-subtle text-default rounded p-2.5 transition" {...rest}>
      {children}
    </button>
  );
};

export const Slider = <T extends string | unknown>({
  title = "",
  className = "",
  items,
  itemKey = (item) => `${item}`,
  renderItem,
  options = {},
}: {
  title?: string;
  className?: string;
  items: T[];
  itemKey?: (item: T) => string;
  renderItem?: (item: T) => JSX.Element;
  options?: Options;
}) => {
  const glide = useRef(null);
  const slider = useRef<Glide.Properties | null>(null);
  const { isLocaleReady } = useLocale();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (glide.current) {
      slider.current = new Glide(glide.current, {
        type: "carousel",
        ...options,
      }).mount();
    }

    return () => slider.current?.destroy();
  }, [options]);

  if (!isClient) {
    return (
      <div className={`mb-2 ${className}`}>
        <div>
          <div className="flex cursor-default items-center pb-3">
            {isLocaleReady ? (
              title && (
                <div>
                  <h2 className="text-emphasis mt-0 text-base font-semibold leading-none">{title}</h2>
                </div>
              )
            ) : (
              <SkeletonText className="h-4 w-24" />
            )}
            <div className="ml-auto flex items-center gap-x-1">
              <SliderButton>
                <Icon name="arrow-left" className="h-5 w-5" />
              </SliderButton>
              <SliderButton>
                <Icon name="arrow-right" className="h-5 w-5" />
              </SliderButton>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, 3).map((item) => {
                if (typeof renderItem !== "function") return null;
                return (
                  <div key={itemKey(item)} className="h-auto">
                    {renderItem(item)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-2 ${className}`}>
      <div className="glide" ref={glide}>
        <div className="flex cursor-default items-center pb-3">
          {isLocaleReady ? (
            title && (
              <div>
                <h2 className="text-emphasis mt-0 text-base font-semibold leading-none">{title}</h2>
              </div>
            )
          ) : (
            <SkeletonText className="h-4 w-24" />
          )}
          <div className="glide__arrows ml-auto flex items-center gap-x-1" data-glide-el="controls">
            <SliderButton data-glide-dir="<">
              <Icon name="arrow-left" className="h-5 w-5" />
            </SliderButton>
            <SliderButton data-glide-dir=">">
              <Icon name="arrow-right" className="h-5 w-5" />
            </SliderButton>
          </div>
        </div>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {items.map((item) => {
              if (typeof renderItem !== "function") return null;
              return (
                <li key={itemKey(item)} className="glide__slide h-auto pl-0">
                  {renderItem(item)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
