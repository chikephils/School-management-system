import { Test, TestingModule } from '@nestjs/testing';
import { CourseRegistrationsController } from './course-registrations.controller';

describe('CourseRegistrationsController', () => {
  let controller: CourseRegistrationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseRegistrationsController],
    }).compile();

    controller = module.get<CourseRegistrationsController>(CourseRegistrationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
