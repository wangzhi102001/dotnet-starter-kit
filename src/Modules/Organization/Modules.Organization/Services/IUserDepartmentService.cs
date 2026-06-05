using FSH.Modules.Organization.Contracts.Dtos;

namespace FSH.Modules.Organization.Services;

public interface IUserDepartmentService
{
    Task<List<UserDepartmentDto>> GetAssignmentsAsync(string userId);
}
