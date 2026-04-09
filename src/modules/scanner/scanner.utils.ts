import { RepoScanSuccess } from './scanner.types';

export const hasNewRelease = ({ currentRepo, fetchedRepo }: RepoScanSuccess) => {
  return currentRepo.last_seen_tag !== fetchedRepo.tag_name;
};
