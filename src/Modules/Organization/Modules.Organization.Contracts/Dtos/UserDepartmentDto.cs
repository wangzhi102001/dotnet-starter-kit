namespace FSH.Modules.Organization.Contracts.Dtos;

public sealed record UserDepartmentDto(
    string UserId,
    Guid DepartmentId,
    string DepartmentName,
    Guid? PositionId,
    string? PositionName,
    bool IsPrimary,
    DateTimeOffset AssignedAtUtc);
