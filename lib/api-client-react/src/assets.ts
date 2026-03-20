import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { customFetch, type ErrorType } from "./custom-fetch";

export interface AssetRecord {
  id: string;
  filename: string;
  mimeType: string;
  kind: "shared";
  storagePath: string;
  publicUrl: string;
  createdAt: string;
}

export function getListAssetsUrl() {
  return "/api/assets";
}

export function getListAssetsQueryKey() {
  return ["/api/assets"] as const;
}

export async function listAssets(options?: RequestInit): Promise<AssetRecord[]> {
  return customFetch<AssetRecord[]>(getListAssetsUrl(), {
    ...options,
    method: "GET",
  });
}

export function useListAssets<
  TData = AssetRecord[],
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<AssetRecord[], TError, TData>;
  request?: RequestInit;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getListAssetsQueryKey();
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => listAssets({ signal, ...options?.request }),
    ...options?.query,
  }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  return { ...query, queryKey };
}

export async function uploadAsset(input: {
  file: File;
  dmKey: string;
}): Promise<AssetRecord> {
  const body = new Uint8Array(await input.file.arrayBuffer());
  const encodedName = encodeURIComponent(input.file.name);

  return customFetch<AssetRecord>(`${getListAssetsUrl()}?filename=${encodedName}`, {
    method: "POST",
    headers: {
      "content-type": input.file.type,
      "x-dm-key": input.dmKey,
    },
    body,
  });
}

export function useUploadAsset<TError = ErrorType<unknown>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<AssetRecord, TError, { file: File; dmKey: string }, TContext>;
  },
): UseMutationResult<AssetRecord, TError, { file: File; dmKey: string }, TContext> {
  return useMutation({
    mutationKey: ["uploadAsset"],
    mutationFn: uploadAsset,
    ...options?.mutation,
  });
}

export async function deleteAssetRequest(input: {
  assetId: string;
  dmKey: string;
}): Promise<null> {
  return customFetch<null>(`${getListAssetsUrl()}/${input.assetId}`, {
    method: "DELETE",
    headers: {
      "x-dm-key": input.dmKey,
    },
  });
}

export function useDeleteAsset<TError = ErrorType<unknown>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<null, TError, { assetId: string; dmKey: string }, TContext>;
  },
): UseMutationResult<null, TError, { assetId: string; dmKey: string }, TContext> {
  return useMutation({
    mutationKey: ["deleteAsset"],
    mutationFn: deleteAssetRequest,
    ...options?.mutation,
  });
}
