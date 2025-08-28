<template>
         
          <div class="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
        
    <div v-if="isLoading && !currentUser" class="text-center mt-8 text-xl text-gray-600">Loading...</div>
    <div v-else-if="!currentUser" class="text-center mt-8 bg-white rounded-xl p-8 shadow-sm">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
      <p class="text-gray-600 mb-6">Please login to view your profile</p>
      <button @click="$router.push('/')" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        Go to Login
      </button>
    </div>
    <div v-else class="space-y-6">
      <!-- Payment Status Alert -->
      <div v-if="paymentStatusAlert" class="mb-6">
        <!-- Success Alert -->
        <div v-if="paymentStatusAlert.type === 'success'" class="bg-green-50 border border-green-200 rounded-xl p-6 text-green-800">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-semibold">🎉 Pagamento Aprovado!</h3>
          </div>
          <p class="text-sm">Sua assinatura foi ativada com sucesso. Agora você tem acesso completo aos tokens do Instagram!</p>
          <button @click="clearPaymentAlert" class="mt-3 text-sm text-green-600 hover:text-green-800 underline">Fechar</button>
        </div>
        
        <!-- Failure Alert -->
        <div v-if="paymentStatusAlert.type === 'failed'" class="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <h3 class="text-lg font-semibold">❌ Pagamento Rejeitado</h3>
          </div>
          <p class="text-sm">Houve um problema com seu pagamento. Tente novamente ou entre em contato conosco.</p>
          <button @click="clearPaymentAlert" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">Fechar</button>
        </div>
        
        <!-- Pending Alert -->
        <div v-if="paymentStatusAlert.type === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-semibold">⏳ Pagamento Pendente</h3>
          </div>
          <p class="text-sm">Seu pagamento está sendo processado. Você receberá uma confirmação em breve.</p>
          <button @click="clearPaymentAlert" class="mt-3 text-sm text-yellow-600 hover:text-yellow-800 underline">Fechar</button>
        </div>
        
        <!-- Error Alert -->
        <div v-if="paymentStatusAlert.type === 'error'" class="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-semibold">⚠️ Erro no Pagamento</h3>
          </div>
          <p class="text-sm">Ocorreu um erro no processamento. Tente novamente ou entre em contato conosco.</p>
          <button @click="clearPaymentAlert" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">Fechar</button>
        </div>

        <!-- Security Warning Alert -->
        <div v-if="paymentStatusAlert.type === 'security_warning'" class="bg-orange-50 border border-orange-200 rounded-xl p-6 text-orange-800">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <h3 class="text-lg font-semibold">🔒 Aviso de Segurança</h3>
          </div>
          <p class="text-sm">{{ paymentStatusAlert.message }}</p>
          <p class="text-xs mt-1 text-orange-600">ID do pagamento: {{ paymentStatusAlert.paymentId }}</p>
          <button @click="clearPaymentAlert" class="mt-3 text-sm text-orange-600 hover:text-orange-800 underline">Fechar</button>
        </div>
      </div>
      
      <!-- Subscription Alert -->
      <div v-if="subscriptionStatus && !subscriptionStatus.isActive && !subscriptionStatus.inTrialPeriod" 
           class="bg-white rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
           
<svg xmlns="http://www.w3.org/2000/svg" class="image-pay" width="794.1218" height="505.34514" viewBox="0 0 794.1218 505.34514" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><path d="M247.4579,701.19842c-12.25095-1.00787-23.067-9.87117-29.218-20.51384-2.06275-3.569-3.47609-8.25063-1.14018-11.64717a6.40928,6.40928,0,0,1,11.315,1.47119,62.04539,62.04539,0,0,1-.96485-12.64086c.09416-3.586.77176-7.64052,3.75358-9.6347,3.45928-2.31349,8.44549-.47663,10.96167,2.83815s3.19894,7.62671,3.80283,11.74426a10.83041,10.83041,0,0,1,12.03865-13.65713c5.06672.76515,9.03581,5.1519,10.58457,10.03641s1.06522,10.18071.06842,15.207c-1.16883,5.89373-3.06582,11.74062-6.481,16.68417s-8.488,8.929-14.37353,10.13822Z" transform="translate(-202.9391 -197.32743)" fill="#f2f2f2"/><path d="M997.0609,303.32743a106.03391,106.03391,0,0,1-71,100.08c-.66016.23-1.33008.46-2,.67v-107.71h-138.77c.04-.67.08984-1.34.1499-2H924.0609v-21.04a5.002,5.002,0,0,0-5-5H790.98082c.23-.67.47021-1.34.73-2a106.01022,106.01022,0,0,1,205.3501,37Z" transform="translate(-202.9391 -197.32743)" fill="#f2f2f2"/><path d="M919.0609,266.32743h-487a7.00778,7.00778,0,0,0-7,7v330a7.00778,7.00778,0,0,0,7,7h487a7.00779,7.00779,0,0,0,7-7v-330A7.00778,7.00778,0,0,0,919.0609,266.32743Zm5,337a5.002,5.002,0,0,1-5,5h-487a5.002,5.002,0,0,1-5-5v-330a5.002,5.002,0,0,1,5-5h487a5.002,5.002,0,0,1,5,5Z" transform="translate(-202.9391 -197.32743)" fill="#3f3d56"/><rect x="223.1218" y="97.03998" width="499" height="2" fill="#3f3d56"/><circle cx="240.1218" cy="84" r="6" fill="#3f3d56"/><circle cx="257.3718" cy="84" r="6" fill="#3f3d56"/><circle cx="274.6218" cy="84" r="6" fill="#3f3d56"/><path d="M562.0609,335.32743h-88a7.00778,7.00778,0,0,0-7,7v88a7.00778,7.00778,0,0,0,7,7h88a7.00779,7.00779,0,0,0,7-7v-88A7.00778,7.00778,0,0,0,562.0609,335.32743Zm5,95a5.002,5.002,0,0,1-5,5h-88a5.002,5.002,0,0,1-5-5v-88a5.002,5.002,0,0,1,5-5h88a5.002,5.002,0,0,1,5,5Z" transform="translate(-202.9391 -197.32743)" fill="#3f3d56"/><path d="M720.0609,335.82743h-88a6.51259,6.51259,0,0,0-6.5,6.5v88a6.51259,6.51259,0,0,0,6.5,6.5h88a6.51259,6.51259,0,0,0,6.5-6.5v-88A6.51259,6.51259,0,0,0,720.0609,335.82743Z" transform="translate(-202.9391 -197.32743)" fill="#6c63ff"/><path d="M878.0609,335.82743h-88a6.51259,6.51259,0,0,0-6.5,6.5v88a6.51259,6.51259,0,0,0,6.5,6.5h88a6.51259,6.51259,0,0,0,6.5-6.5v-88A6.51259,6.51259,0,0,0,878.0609,335.82743Z" transform="translate(-202.9391 -197.32743)" fill="#e6e6e6"/><path d="M562.0609,467.82743h-88a6.51259,6.51259,0,0,0-6.5,6.5v88a6.51259,6.51259,0,0,0,6.5,6.5h88a6.51259,6.51259,0,0,0,6.5-6.5v-88A6.51259,6.51259,0,0,0,562.0609,467.82743Z" transform="translate(-202.9391 -197.32743)" fill="#e6e6e6"/><path d="M720.0609,467.82743h-88a6.51259,6.51259,0,0,0-6.5,6.5v88a6.51259,6.51259,0,0,0,6.5,6.5h88a6.51259,6.51259,0,0,0,6.5-6.5v-88A6.51259,6.51259,0,0,0,720.0609,467.82743Z" transform="translate(-202.9391 -197.32743)" fill="#6c63ff"/><path d="M878.0609,467.82743h-88a6.51259,6.51259,0,0,0-6.5,6.5v88a6.51259,6.51259,0,0,0,6.5,6.5h88a6.51259,6.51259,0,0,0,6.5-6.5v-88A6.51259,6.51259,0,0,0,878.0609,467.82743Z" transform="translate(-202.9391 -197.32743)" fill="#e6e6e6"/><path d="M540.5609,482.32743h-88a6.50745,6.50745,0,0,1-6.5-6.5v-88a6.50744,6.50744,0,0,1,6.5-6.5h88a6.50745,6.50745,0,0,1,6.5,6.5v88A6.50745,6.50745,0,0,1,540.5609,482.32743Z" transform="translate(-202.9391 -197.32743)" fill="#6c63ff"/><polygon points="202.746 492.088 214.466 488.491 206.17 441.573 188.872 446.881 202.746 492.088" fill="#a0616a"/><path d="M403.482,680.85789h38.53073a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H418.36887A14.88686,14.88686,0,0,1,403.482,680.8579v0A0,0,0,0,1,403.482,680.85789Z" transform="translate(825.89112 1024.95669) rotate(162.93912)" fill="#2f2e41"/><polygon points="102.748 492.358 115.008 492.357 120.84 445.069 102.746 445.07 102.748 492.358" fill="#a0616a"/><path d="M303.06,686.18167h38.53073a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H317.94689A14.88686,14.88686,0,0,1,303.06,686.18168v0a0,0,0,0,1,0,0Z" transform="translate(441.74335 1189.90807) rotate(179.99738)" fill="#2f2e41"/><path d="M304.80743,552.60788a9.16224,9.16224,0,0,1,.318-14.04558l9.50536-119.69459,19.33086,4.8297L318.48407,540.45594a9.21188,9.21188,0,0,1-13.67664,12.15194Z" transform="translate(-202.9391 -197.32743)" fill="#a0616a"/><circle cx="140.57921" cy="150.55523" r="24.56103" fill="#a0616a"/><path d="M322.16166,415.18605c-5.54194-7.60815-5.71269-18.08683.25708-25.36412,3.89587-4.74914,10.41248-8.54951,21.29248-8.54951,29,0,40,23,40,23s12,22,5,42-7,22-7,22l-46-4S343.47142,444.44079,322.16166,415.18605Z" transform="translate(-202.9391 -197.32743)" fill="#ccc"/><path d="M307.9766,435.09469l9.90967-32.4209a15.50189,15.50189,0,0,1,21.93018-9.24512h0a15.53,15.53,0,0,1,7.08789,20.00977L334.306,442.12984Z" transform="translate(-202.9391 -197.32743)" fill="#ccc"/><path d="M380.71122,463.27242l39,202-21,6-51-133-23,136-22,3s-9.65032-179.945,33-213Z" transform="translate(-202.9391 -197.32743)" fill="#2f2e41"/><path d="M436.84246,453.80485a10.52712,10.52712,0,0,0-.96265,1.3493l-49.53505,2.40166-9.53834-29.11951-16.56185,7.87143,15.58776,43.3713,61.26206-11.98076a10.49579,10.49579,0,1,0-.25193-13.89342Z" transform="translate(-202.9391 -197.32743)" fill="#a0616a"/><path d="M353.31425,407.17672a15.50085,15.50085,0,0,1,16.3623-17.28223h0a15.52954,15.52954,0,0,1,14.53467,15.47168v31.335l-26.936,4.14453Z" transform="translate(-202.9391 -197.32743)" fill="#ccc"/><path d="M348.91975,372.66645c-3.68637-.01605-6.53017-3.89721-6.36494-7.57991s2.63867-6.92285,5.61866-9.09293,6.47479-3.49191,9.798-5.08739,6.61743-3.58561,8.66924-6.64822a14.71557,14.71557,0,0,0,1.02332-13.50438,21.66865,21.66865,0,0,0-9.3332-10.22418,28.37777,28.37777,0,0,0-37.60707,8.25038l-4.20808,11.45787c-4.28786,5.15613-4.968,12.81333-2.33217,18.97968s8.24814,10.80579,14.58112,13.0114a35.79392,35.79392,0,0,0,19.8411.59488" transform="translate(-202.9391 -197.32743)" fill="#2f2e41"/><path d="M326.47317,334.50613c-1.80894-2.89931-4.94439-4.74325-8.18587-5.82543a25.72431,25.72431,0,0,0-33.83244,23.00283c-.34357,6.31437,1.63365,12.48912,2.79545,18.70518s1.39291,13.08161-2.03446,18.396c-2.61053,4.0478-6.96387,6.59634-11.26083,8.77251-3.58128,1.81371-7.45507,3.51578-11.45314,3.1544s-8.01642-3.52812-7.91033-7.54108a32.0544,32.0544,0,0,0-2.68163,9.08033c-.28127,3.15593.49659,6.56125,2.77606,8.76193,3.3131,3.19859,8.56255,2.9646,13.1157,2.27441,9.85694-1.49417,19.83818-4.29543,27.62552-10.52031s12.95465-16.47494,10.90388-26.23127c-.85666-4.07547-2.86993-7.796-4.49677-11.62968s-2.89692-8.027-2.14959-12.124a14.73513,14.73513,0,0,1,7.49255-9.98176,19.60142,19.60142,0,0,1,12.52266-1.899c2.79906.45932,6.29406,1.17251,7.95419-1.12742a4.50752,4.50752,0,0,0-.09367-4.80858,13.24754,13.24754,0,0,0-3.59259-3.5596" transform="translate(-202.9391 -197.32743)" fill="#2f2e41"/><path d="M511.4238,702.67257h-307.294a1.19069,1.19069,0,1,1,0-2.38137h307.294a1.19069,1.19069,0,1,1,0,2.38137Z" transform="translate(-202.9391 -197.32743)" fill="#3f3d56"/></svg>
        <div class="flex items-start gap-3 mb-4">
          <div class="text-xl"></div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">Mantenha seu feed sempre atualizado e protegido</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Para ter acesso contínuo às suas fotos e informações do Instagram sem se preocupar com tokens expirados, 
              você precisa de uma assinatura ativa. Assim você fica livre de stress e sempre com os dados atualizados!
            </p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Plano Mensal -->
          <div class="flex-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
            <div class="text-center mb-4">
              <div class="font-semibold text-gray-900">GetMyToken</div>
              <div class="font-bold text-blue-600 text-2xl">R$ 4,97/mês</div>
              <div class="text-sm text-gray-600">Plano Mensal</div>
            </div>
            <button @click="startSubscription('monthly')" class="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 hover:from-cyan-500 hover:via-blue-600 hover:to-blue-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <img src="https://http2.mlstatic.com/storage/mobile-on-demand-resources/image/web-private-nav-mp-logo_1X?updatedAt=1746639317789" alt="MP" class="h-6">
              Assinar Mensal
            </button>
          </div>
          
          <!-- Plano Anual -->
          <div class="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4 relative">
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">MELHOR VALOR</span>
            </div>
            <div class="text-center mb-4">
              <div class="font-semibold text-gray-900">GetMyToken</div>
              <div class="font-bold text-green-600 text-2xl">R$ 49,70/ano</div>
              <div class="text-sm text-gray-600">Plano Anual</div>
              <div class="text-xs text-green-600 font-medium">Economize 2 meses!</div>
            </div>
            <button @click="startSubscription('yearly')" class="w-full px-6 py-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-600 hover:to-green-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <img src="https://http2.mlstatic.com/storage/mobile-on-demand-resources/image/web-private-nav-mp-logo_1X?updatedAt=1746639317789" alt="MP" class="h-6">
              Assinar Anual
            </button>
          </div>
        </div>
        
        
      </div>
      
      <!-- Trial Period Alert -->
      <div v-if="subscriptionStatus && subscriptionStatus.inTrialPeriod" 
           class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div class="flex items-start gap-4 mb-4">
          <div class="text-2xl">✨</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Período de Teste Gratuito</h3>
            <p class="text-blue-100">
              <strong class="text-yellow-300">Faltam {{ subscriptionStatus.daysLeft }} dias</strong> 
              para acabar seu teste grátis.
            </p>
          </div>
        </div>
        <button @click="startSubscription('yearly')" class="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 hover:from-cyan-500 hover:via-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all backdrop-blur-sm shadow-xl transform hover:scale-105 flex items-center gap-2">
          <img src="https://http2.mlstatic.com/ui/navigation/5.19.1/mercadopago/logo__large_plus.png" alt="MP" class="h-4 brightness-0 invert">
          Assinar Agora
        </button>
      </div>
      
      <!-- Active Subscription Info -->
      <div v-if="subscriptionStatus && subscriptionStatus.isActive" class="bg-white rounded-xl p-6 mb-6 border-l-4 border-green-500 shadow-sm">
        <div class="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Assinatura Ativa
        </div>
        <div class="space-y-2 text-gray-700">
          <p><strong>Plano:</strong> {{ getSubscriptionPlanName() }}</p>
          <p v-if="subscriptionStatus.subscription.ends_at">
            <strong>Válido até:</strong> {{ formatDate(subscriptionStatus.subscription.ends_at) }}
          </p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-8 mb-6 shadow-sm flex items-center gap-8">
        <div class="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
          <img v-if="currentUser.profile_picture" :src="currentUser.profile_picture" alt="Profile picture" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-4xl font-bold flex items-center justify-center">
            {{ currentUser.username?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
        <div class="flex-grow">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ currentUser.username }}</h1>
          <h2 v-if="currentUser.full_name" class="text-lg text-gray-600 mb-6">{{ currentUser.full_name }}</h2>
          
         
          <button @click="logout" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-lg">
            Logout
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm">
        
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Your Token Script</h3>
        <p class="text-gray-600 mb-4">Add this script to your website to use your Instagram token:</p>
        
        <div class="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6 relative font-mono text-sm overflow-x-auto">
          <code v-if="scriptTagDisplay">{{ scriptTagDisplay }}</code>
          <div v-else class="text-red-400">
            Erro: Token script não disponível. 
            <br>Debug: currentUser.api_key = {{ currentUser?.api_key || 'undefined' }}
            <br>Debug: currentUser.id = {{ currentUser?.id || 'undefined' }}
          </div>
          <button @click="copyScriptTag" :disabled="!scriptTagDisplay" class="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-xs transition-colors">
            Copy
          </button>
        </div>
        
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">How to Use</h4>
            <p class="text-gray-600 mb-3">Once you've added the script to your website, you can access your token via the <code class="bg-gray-100 px-2 py-1 rounded text-sm">window.myInstagramToken</code> variable.</p>
            
            <div class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <div>const token = window.myInstagramToken;</div>
              <div class="text-gray-400">// Use the token to fetch Instagram data</div>
            </div>
          </div>
          
          <div class="pt-6 border-t border-gray-200">
            
            <h4 class="text-lg font-medium text-gray-900 mb-4">Token Information</h4>
            <div class="mb-4">
              <button @click="refreshTokenHandler" :disabled="isRefreshing" 
                      class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-lg disabled:transform-none disabled:shadow-none">
                {{ isRefreshing ? 'Refreshing...' : 'Refresh Token' }}
              </button>
            </div>
            
            <div v-if="effectiveTokenExpiresAt" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <h5 class="font-semibold text-yellow-800">Token Expiration</h5>
              </div>
              <p class="text-sm text-yellow-700 mb-2">
                <strong>Expires:</strong> {{ formatExpirationDate(effectiveTokenExpiresAt) }}
              </p>
              
              <p class="text-xs text-yellow-600 mt-2">
                Tokens do Instagram expiram automaticamente. Com uma assinatura ativa, seus tokens são renovados automaticamente.
              </p>
            </div>
            
            <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p class="text-sm text-gray-600">
                Informações de expiração do token não disponíveis. 
                <button @click="refreshTokenHandler" class="text-blue-600 hover:text-blue-800 underline">
                  Clique aqui para atualizar
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import api from '../services/api';

export default {
  name: 'ProfileView',
  data() {
    return {
      isRefreshing: false,
      tokenExpiresAt: null,
      copiedMessage: '',
      subscriptionStatus: null,
      isLoadingSubscription: false,
      paymentStatusAlert: null
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'isLoading']),
    
    tokenScriptUrl() {
      if (!this.currentUser) return '';
      // Usar api_key que é o campo correto retornado pela API
      const identifier = this.currentUser.api_key || this.currentUser.id;
      if (!identifier) return '';
      return api.getTokenScript(identifier);
    },
    
    scriptTagDisplay() {
      // Exibe a tag de script usando concatenação para evitar conflitos com o parser
      if (!this.tokenScriptUrl) return '';
      return '<' + 'script src="' + this.tokenScriptUrl + '">' + '</' + 'script>';
    },
    
    // Computed property para gerenciar a data de expiração do token
    effectiveTokenExpiresAt() {
      // Prioriza tokenExpiresAt (de refresh/fetch), depois currentUser.token_expires_at
      return this.tokenExpiresAt || this.currentUser?.token_expires_at;
    }
  },
  methods: {
    ...mapActions(['refreshToken', 'logout']),
    
    copyScriptTag() {
      if (!this.tokenScriptUrl) {
        alert('Token script não disponível. Verifique se você está autenticado corretamente.');
        return;
      }
      
      // Usa concatenação para criar a tag de script e evitar conflitos com o parser
      const scriptText = '<' + 'script src="' + this.tokenScriptUrl + '">' + '</' + 'script>';
      
      navigator.clipboard.writeText(scriptText)
        .then(() => {
          alert('Script tag copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    },
    
    refreshTokenHandler() {
      this.isRefreshing = true;
      this.refreshToken()
        .then(response => {
          console.log('Refresh token response:', response);
          // A resposta vem de response.data do action, então é diretamente response.expires_at
          this.tokenExpiresAt = new Date(response.expires_at);
          this.isRefreshing = false;
          
          // Mostrar mensagem de sucesso
          alert('Token atualizado com sucesso! Nova data de expiração: ' + this.formatExpirationDate(response.expires_at));
          
          // Recarregar os dados do usuário para atualizar a data de expiração do token
          this.$store.dispatch('fetchCurrentUser');
        })
        .catch((error) => {
          console.error('Error refreshing token:', error);
          alert('Erro ao atualizar token. Tente novamente.');
          this.isRefreshing = false;
        });
    },
    
    formatExpirationDate(dateString) {
      if (!dateString) return 'Não disponível';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      if (diffDays < 0) {
        return `${dateFormatted} (Expirado)`;
      } else if (diffDays === 0) {
        return `${dateFormatted} (Expira hoje!)`;
      } else if (diffDays === 1) {
        return `${dateFormatted} (Expira amanhã)`;
      } else if (diffDays <= 7) {
        return `${dateFormatted} (Expira em ${diffDays} dias)`;
      } else {
        return `${dateFormatted} (Expira em ${diffDays} dias)`;
      }
    },
    
    // Subscription methods
    getSubscriptionStatus() {
      console.log('Profile: Fetching subscription status...');
      this.isLoadingSubscription = true;
      this.$store.dispatch('getSubscriptionStatus')
        .then(response => {
          console.log('Profile: Subscription status received:', response);
          this.subscriptionStatus = response;
          this.isLoadingSubscription = false;
        })
        .catch(error => {
          console.error('Profile: Error fetching subscription status:', error);
          this.isLoadingSubscription = false;
        });
    },
    
    startSubscription(plan) {
      console.log('Starting subscription for plan:', plan);
      
      // Verificar se o usuário está logado com Instagram
      if (!this.currentUser || !this.currentUser.instagram_user_id) {
        alert('Você precisa estar conectado ao Instagram para criar uma assinatura. Por favor, faça login novamente.');
        return;
      }

      // Solicitar email do usuário
      const userEmail = prompt('Digite seu email para a assinatura:');
      
      if (!userEmail || !userEmail.includes('@')) {
        alert('Email válido é obrigatório para criar a assinatura.');
        return;
      }

      // Usar a nova API de assinatura recorrente (com email)
      api.createRecurringSubscription(plan, userEmail)
        .then(response => {
          console.log('Recurring subscription response:', response.data);
          
          if (response.data.success && response.data.init_point) {
            // Redireciona para a página de checkout do Mercado Pago
            console.log('Redirecting to:', response.data.init_point);
            window.location.href = response.data.init_point;
          } else {
            alert('Erro ao criar assinatura: ' + (response.data.message || 'Erro desconhecido'));
          }
        })
        .catch(error => {
          console.error('Error creating recurring subscription:', error);
          const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao criar sua assinatura. Por favor, tente novamente.';
          alert(errorMessage);
        });
    },
    
    getSubscriptionPlanName() {
      if (!this.subscriptionStatus || !this.subscriptionStatus.subscription) {
        return 'Desconhecido';
      }
      
      const plan = this.subscriptionStatus.subscription.plan;
      if (plan === 'monthly') {
        return 'Mensal (R$29,90/mês)';
      } else if (plan === 'yearly') {
        return 'Anual (R$299,90/ano)';
      }
      return plan;
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    
    // Fetch token information
    fetchTokenInfo() {
      console.log('Fetching token info...');
      api.getTokenInfo()
        .then(response => {
          console.log('getTokenInfo response:', response);
          if (response.data && response.data.expires_at) {
            this.tokenExpiresAt = new Date(response.data.expires_at);
            console.log('tokenExpiresAt set to:', this.tokenExpiresAt);
          }
        })
        .catch(error => {
          console.error('Error fetching token info:', error);
        });
    },
    
    // Payment status methods
    checkPaymentStatus() {
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionStatus = urlParams.get('subscription_status');
      const paymentId = urlParams.get('payment_id');
      const userId = urlParams.get('user_id');
      const reason = urlParams.get('reason');
      
      if (subscriptionStatus) {
        // Validar se o user_id do pagamento corresponde ao usuário atual (se disponível)
        if (userId && this.currentUser && this.currentUser.id && 
            parseInt(userId) !== this.currentUser.id) {
          console.warn('Payment user_id mismatch:', {
            paymentUserId: userId,
            currentUserId: this.currentUser.id
          });
          
          // Mostrar alerta de segurança
          this.paymentStatusAlert = {
            type: 'security_warning',
            message: 'Este pagamento não pertence à sua conta. Por favor, faça login com a conta correta.',
            paymentId,
            userId
          };
        } else {
          // Pagamento válido ou sem user_id (compatibilidade)
          this.paymentStatusAlert = {
            type: subscriptionStatus,
            paymentId,
            userId,
            reason
          };
        }
        
        // Clear URL parameters after showing the alert
        const url = new URL(window.location);
        url.searchParams.delete('subscription_status');
        url.searchParams.delete('payment_id');
        url.searchParams.delete('user_id');
        url.searchParams.delete('reason');
        // Remove Mercado Pago internal parameters
        url.searchParams.delete('zx');
        url.searchParams.delete('no_sw_cr');
        window.history.replaceState({}, document.title, url.pathname);
        
        // If payment was successful and belongs to current user, refresh subscription status
        if (subscriptionStatus === 'success' && 
            (!userId || !this.currentUser || parseInt(userId) === this.currentUser.id)) {
          setTimeout(() => {
            this.getSubscriptionStatus();
          }, 1000);
        }
      }
    },
    
    clearPaymentAlert() {
      this.paymentStatusAlert = null;
    }
  },
  watch: {
    currentUser(newUser) {
      console.log('currentUser changed:', newUser);
      if (newUser) {
        // User loaded, fetch subscription status and token info
        console.log('User loaded, fetching subscription status and token info');
        this.getSubscriptionStatus();
        this.fetchTokenInfo();
      }
    }
  },
  mounted() {
    console.log('Profile mounted - currentUser:', this.currentUser, 'isLoading:', this.isLoading);
    
    // Check payment status from URL parameters first
    this.checkPaymentStatus();
    
    // Check if user is authenticated - but wait for loading to complete
    if (!this.currentUser && !this.isLoading) {
      console.log('No user and not loading, redirecting to login');
      this.$router.push('/');
      return;
    }
    
    // If we have a user, fetch subscription status and token info
    if (this.currentUser) {
      console.log('User is authenticated, fetching subscription status and token info');
      this.getSubscriptionStatus();
      this.fetchTokenInfo();
    } else {
      console.log('Waiting for user data to load before fetching subscription');
    }
    
    // Also try to fetch token info immediately if user is available
    this.fetchTokenInfo();
  }
};
</script>

<style scoped>
/* Tailwind CSS handles all styling */
.image-pay{
      width: 200px;
    height: fit-content;
    margin-bottom: 1rem;
}
</style>
