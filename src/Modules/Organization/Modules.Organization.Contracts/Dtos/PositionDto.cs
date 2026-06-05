namespace FSH.Modules.Organization.Contracts.Dtos;

public sealed record PositionDto(
    Guid Id,
    string Name,
    string Code,
    int SortOrder,
    bool IsActive);
