import { Test, TestingModule } from '@nestjs/testing';
import { AcademicCategoriesService } from './academic-categories.service';

describe('AcademicCategoriesService', () => {
  let service: AcademicCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicCategoriesService],
    }).compile();

    service = module.get<AcademicCategoriesService>(AcademicCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
