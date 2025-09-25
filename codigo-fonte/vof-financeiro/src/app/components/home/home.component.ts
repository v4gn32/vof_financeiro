import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-primary-600">VOF Financeiro</h1>
            </div>
            <div class="flex space-x-4">
              <a routerLink="/login" class="btn-secondary">Entrar</a>
              <a routerLink="/register" class="btn-primary">Criar Conta</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão Financeira
              <span class="text-primary-600">Simplificada</span>
              para MEI
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Controle suas receitas, despesas e notas fiscais de forma intuitiva. 
              Desenvolvido especialmente para microempreendedores individuais.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/register" class="btn-primary text-lg px-8 py-4">
                Começar Gratuitamente
              </a>
              <a routerLink="/login" class="btn-secondary text-lg px-8 py-4">
                Já tenho conta
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para gerenciar suas finanças
            </h2>
            <p class="text-xl text-gray-600">
              Ferramentas profissionais em uma interface simples e intuitiva
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center p-6">
              <div class="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Dashboard Inteligente</h3>
              <p class="text-gray-600">
                Visualize suas receitas, despesas e saldo de forma clara com gráficos e métricas em tempo real.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center p-6">
              <div class="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Controle de Lançamentos</h3>
              <p class="text-gray-600">
                Registre receitas e despesas com categorização automática, parcelamento e filtros avançados.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center p-6">
              <div class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Notas Fiscais MEI</h3>
              <p class="text-gray-600">
                Gerencie suas notas fiscais emitidas como MEI com controle de status e vencimentos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-primary-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            Pronto para organizar suas finanças?
          </h2>
          <p class="text-xl text-primary-100 mb-8">
            Junte-se a milhares de MEIs que já transformaram sua gestão financeira
          </p>
          <a routerLink="/register" class="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200">
            Criar Conta Gratuita
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">VOF Financeiro</h3>
              <p class="text-gray-400">
                Gestão financeira simplificada para microempreendedores individuais.
              </p>
            </div>
            <div>
              <h4 class="text-sm font-semibold mb-4">Produto</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" class="hover:text-white">Preços</a></li>
                <li><a href="#" class="hover:text-white">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-sm font-semibold mb-4">Empresa</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white">Sobre</a></li>
                <li><a href="#" class="hover:text-white">Blog</a></li>
                <li><a href="#" class="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-sm font-semibold mb-4">Legal</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white">Privacidade</a></li>
                <li><a href="#" class="hover:text-white">Termos</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VOF Financeiro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent {}