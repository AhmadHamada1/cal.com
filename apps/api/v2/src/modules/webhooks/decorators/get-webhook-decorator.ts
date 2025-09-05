import { Webhook } from "@calcom/prisma/client";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type GetWebhookReturnType = Webhook;

export const GetWebhook = createParamDecorator<
  keyof GetWebhookReturnType | (keyof GetWebhookReturnType)[],
  ExecutionContext
>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const webhook = request.webhook as GetWebhookReturnType;

  if (!webhook) {
    throw new Error("GetWebhook decorator : Webhook not found");
  }

  if (Array.isArray(data)) {
    return data.reduce((prev, curr) => {
      return {
        ...prev,
        [curr]: webhook[curr],
      };
    }, {});
  }

  if (data) {
    return webhook[data];
  }

  return webhook;
});
