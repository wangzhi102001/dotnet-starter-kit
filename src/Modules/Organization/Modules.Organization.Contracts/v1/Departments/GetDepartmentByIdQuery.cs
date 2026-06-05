using FSH.Modules.Organization.Contracts.Dtos;
using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Departments;

public sealed record GetDepartmentByIdQuery(Guid DepartmentId) : IQuery<DepartmentDto>;
