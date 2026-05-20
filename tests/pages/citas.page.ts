import { Page, Locator, expect } from "@playwright/test";

export class CitasPage {
  private readonly estadoFiltro: Locator;

  constructor(private readonly page: Page) {
    this.estadoFiltro = page.getByRole("combobox", {
      name: /filtrar por estado/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/citas");
  }

  async cambiarEstadoCita(index: number, nuevoEstado: string): Promise<void> {
    const filas = this.page.getByTestId("cita-row");
    const fila = filas.nth(index);
    if (/confirmada|confirmar/i.test(nuevoEstado)) {
      await fila.getByRole("button", { name: /confirmar/i }).click();
    } else if (/realizada|realizado|completar/i.test(nuevoEstado)) {
      await fila.getByRole("button", { name: /realizado|completar/i }).click();
      // Handle the done-form step
      const soloMarcarBtn = this.page.getByRole("button", {
        name: /solo marcar como realizado/i,
      });
      await expect(soloMarcarBtn).toBeVisible({ timeout: 5000 });
      await soloMarcarBtn.click();
      // Handle the review-prompt step
      const noConfirmBtn = this.page.getByRole("button", {
        name: /no, solo marcar como realizado/i,
      });
      await expect(noConfirmBtn).toBeVisible({ timeout: 5000 });
      await noConfirmBtn.click();
    } else if (/cancelar|cancelada/i.test(nuevoEstado)) {
      await fila.getByRole("button", { name: /cancelar/i }).click();
    }
  }

  async verBadgeEstado(index: number): Promise<Locator> {
    return this.page
      .getByTestId("cita-row")
      .nth(index)
      .getByTestId("estado-badge");
  }
}
