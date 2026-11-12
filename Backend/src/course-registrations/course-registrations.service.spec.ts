import { Test, TestingModule } from '@nestjs/testing';
import { CourseRegistrationsService } from './course-registrations.service';

describe('CourseRegistrationsService', () => {
  let service: CourseRegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseRegistrationsService],
    }).compile();

    service = module.get<CourseRegistrationsService>(CourseRegistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
