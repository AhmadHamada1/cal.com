import { handleQueuedFormResponseCleanup } from "@calcom/app-store/routing-forms/cron/queuedFormResponseCleanup";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

export const POST = defaultResponderForAppDir(handleQueuedFormResponseCleanup);
