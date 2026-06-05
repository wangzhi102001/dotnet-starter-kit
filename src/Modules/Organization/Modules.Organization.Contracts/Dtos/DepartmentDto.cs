namespace FSH.Modules.Organization.Contracts.Dtos;

public sealed record DepartmentDto(
    Guid Id,
    string Name,
    string Code,
    string? Path,
    Guid? ParentId,
    int SortOrder,
    bool IsActive,
    int MemberCount,
    DateTimeOffset CreatedOnUtc);
