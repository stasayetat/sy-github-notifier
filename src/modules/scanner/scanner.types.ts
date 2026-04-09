import { ApiResponse, LatestReleaseResponse, Subscription } from '@shared/types';
import { Repository } from '@shared/types/repository.types';

export type RepoScanError = {
  currentRepo: Repository;
  error: ApiResponse;
};

export type RepoScanSuccess = {
  currentRepo: Repository;
  fetchedRepo: LatestReleaseResponse;
};

export type RepoNotifyInfo = {
  repo: Repository;
  newTag: string;
  subscribers: Subscription[];
};
