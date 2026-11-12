import { Test, TestingModule } from '@nestjs/testing';
import { AcademicCategoriesController } from './academic-categories.controller';

describe('AcademicCategoriesController', () => {
  let controller: AcademicCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicCategoriesController],
    }).compile();

    controller = module.get<AcademicCategoriesController>(AcademicCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
