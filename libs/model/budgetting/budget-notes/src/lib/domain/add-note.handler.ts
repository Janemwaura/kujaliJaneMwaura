import { AddNoteToBudgetCommand } from './add-note.command';

export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}

export class AddNoteToBudgetHandler
  implements ICommandHandler<AddNoteToBudgetCommand>
{
  constructor(private readonly repo: any) {}

  async execute(command: AddNoteToBudgetCommand): Promise<void> {
    if (!command.content?.trim()) {
      throw new Error('Note content cannot be empty');
    }

    await this.repo.addNote(command.budgetId, {
      content: command.content,
      createdBy: command.createdBy,
      createdAt: command.createdAt,
    });
  }
}
