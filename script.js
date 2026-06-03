// Página atual exibida no livro
let paginaAtual = 0;
// Estado que indica se o livro já foi aberto
let livroAberto = false;
// Controle para evitar troca de página durante animação de transição
let emTransicao = false;

// Quantidade total de capítulos no livro (sem contar a contra-capa)
const TOTAL_CAPITULOS = 6;

// --- Localização básica (i18n) ---
// Permite troca de idioma em textos do minigame se necessário
const LOCALE = 'pt';
const TRANSLATIONS = {
    pt: {
        simulatorTitle: '🌾 Recuperando o Solo 🌾',
        soloInicial: 'Solo árido — 0%',
        actions: {
            arar: '🚜 Arar',
            plantar: '🌱 Plantar',
            adubar: '🍂 Adubar',
            regar: '💧 Regar'
        },
        soloEtapa1: 'Solo preparado',
        soloEtapa2: 'Brotando vida',
        soloEtapa3: '🌱 Solo rico e produtivo! 100%',
        mensagemFinal: '🎉 Parabéns! Você ajudou o Pedro a dar vida nova à terra.',
        jogarDeNovo: '↻ Jogar de novo',
        acaoIncorreta: 'Faça a ação correta:'
    },
    en: {
        simulatorTitle: '🌾 Restoring the Soil 🌾',
        soloInicial: 'Arid soil — 0%',
        actions: {
            arar: '🚜 Plow',
            plantar: '🌱 Plant',
            adubar: '🍂 Fertilize',
            regar: '💧 Water'
        },
        soloEtapa1: 'Soil prepared',
        soloEtapa2: 'Life sprouting',
        soloEtapa3: '🌱 Rich productive soil! 100%',
        mensagemFinal: '🎉 Congrats! You helped Pedro bring the land back to life.',
        jogarDeNovo: '↻ Play again',
        acaoIncorreta: 'Do the correct action:'
    }
};

// Função simples de tradução com paths como 'actions.arar'
function t(path) {
    const parts = path.split('.');
    let cur = TRANSLATIONS[LOCALE] || TRANSLATIONS.pt;
    for (const p of parts) {
        if (cur[p] === undefined) return path;
        cur = cur[p];
    }
    return cur;
}

// Índice da próxima ação esperada no minigame
let indiceEsperado = 0;

// Atualiza o estado e aparência dos botões do minigame
function atualizarBotoesSequencia() {
    document.querySelectorAll('.btn-acao').forEach(b => {
        const ac = b.dataset.acao;
        if (feitas.has(ac)) {
            b.disabled = true;
            b.classList.add('feito');
        } else {
            b.disabled = (ac !== ACOES[indiceEsperado]);
            if (!b.disabled) b.classList.remove('feito');
        }
    });
}

// Conteúdo do livro: capítulos, página final e contra-capa
const conteudo = [
    {
        esq: {
            tit: "Capítulo 1 – A herança inesperada",
            txt: "Pedro vivia na cidade, celular na mão e planos bem longe da roça. Mas tudo mudou quando seu avô faleceu e deixou pra ele a antiga fazenda da família — uma terra que vinha passando de geração em geração."
        },
        dir: {
            txt: "Pedro teve que ir até lá assumir a responsabilidade. No começo, parecia só um fim de semana rápido no campo, mas alguma coisa dentro dele já sentia que aquela viagem ia mudar tudo."
        }
    },
    {
        esq: {
            tit: "Capítulo 2 – O peso da tradição",
            txt: "Ao chegar, Pedro encontrou uma fazenda simples, com ferramentas antigas e pouca produção. Os vizinhos falavam que aquela terra já não dava mais resultado."
        },
        dir: {
            txt: "Ele pensou em vender tudo, mas encontrou um caderno do avô com anotações sobre cuidado com o solo e respeito à natureza. Aquelas palavras o fizeram parar e pensar melhor antes de decidir."
        }
    },
    {
        esq: {
            tit: "Capítulo 3 – Entre o passado e o presente",
            txt: "Decidido a tentar, Pedro começou a estudar pela internet sobre agricultura sustentável e novas tecnologias no campo."
        },
        dir: {
            txt: "Ele percebeu que podia unir o conhecimento antigo do avô com as ideias modernas de inovação — o saber de gerações passadas ganhando força com ciência e tecnologia."
        }
    },
    {
        esq: {
            tit: "Capítulo 4 – Mudanças na terra",
            txt: "Pedro aplicou economia de água, rotação de culturas, uso de energia solar e técnicas simples para melhorar o solo."
        },
        dir: {
            txt: "No começo deu errado várias vezes, mas ele não desistiu. Aos poucos, a fazenda começou a reagir: o solo ficou mais escuro, as plantas mais fortes e a esperança voltou a crescer."
        }
    },
    {
        esq: {
            tit: "Capítulo 5 – Crescimento e comunidade",
            txt: "A produção melhorou, e os vizinhos começaram a notar. Pedro passou a compartilhar suas ideias e ajudar outros produtores da região."
        },
        dir: {
            txt: "A fazenda virou um exemplo de inovação e sustentabilidade, mostrando que o campo e a cidade podem crescer juntos, trocando conhecimento, cultura e respeito pela terra."
        }
    },
    {
        esq: {
            tit: "Capítulo 6 – A terra viva",
            txt: "Pedro provou que a terra tem solução. Separou uma parte da fazenda e começou a recuperar o solo com adubo natural, plantio certo e muito cuidado."
        },
        dir: {
            txt: "Agora é a sua vez — ajude o Pedro a fertilizar este pedaço de terra!",
            simulador: true
        }
    },
    {
        fim: true,
        esq: {
            tit: "Fim",
            txt: "A história de Pedro nos mostra que cuidar da terra é também cuidar do nosso futuro. Com respeito, conhecimento e dedicação, qualquer terra pode voltar a florescer."
        },
        dir: {
            txt: "\"A terra cuida de quem cuida dela.\"\n\nAgrinho 2026"
        }
    },
    {
        contraCapa: true,
        esq: { tit: '', txt: '' },
        dir: { txt: '' }
    }
];

// Lista de ações do minigame na ordem correta
const ACOES = ['arar', 'adubar', 'plantar', 'regar'];
let progresso = 0;
let feitas = new Set();

// Verifica se todas as etapas do minigame foram completadas
function minigameCompleto() {
    return feitas.size === ACOES.length;
}

// Abre o livro e mostra as páginas internas
function abrirLivro() {
    if (livroAberto) return; // evita reabrir várias vezes
    atualizarPaginas();
    const livro = document.getElementById('livro');
    livro.classList.add('aberto');
    livroAberto = true;
    const fundoControle = document.getElementById('fundo-controle');
    if (fundoControle) fundoControle.style.display = 'none';
    setTimeout(() => {
        document.getElementById('controles').classList.remove('escondido');
    }, 1100);
}

// Navega entre páginas do livro com animação
function mudarPagina(direcao) {
    if (emTransicao) return;

    const novaPagina = Math.max(0, Math.min(conteudo.length - 1, paginaAtual + direcao));
    if (novaPagina === paginaAtual) return;
    if (conteudo[novaPagina].contraCapa && !minigameCompleto()) return;

    emTransicao = true;

    const paginaEsq = document.querySelector('.pagina-esq');
    const paginaDir = document.querySelector('.pagina-dir');

    paginaEsq.classList.add('saindo');
    paginaDir.classList.add('saindo');

    setTimeout(() => {
        paginaAtual = novaPagina;
        atualizarPaginas();

        paginaEsq.classList.remove('saindo');
        paginaDir.classList.remove('saindo');
        paginaEsq.classList.add('entrando');
        paginaDir.classList.add('entrando');

        setTimeout(() => {
            paginaEsq.classList.remove('entrando');
            paginaDir.classList.remove('entrando');
            emTransicao = false;
        }, 380);
    }, 300);
}

// Transforma números em texto para estilo de capítulo
function numerosEmItalico(texto) {
    return texto.replace(/\d+/g, '<span class="numero-capitulo">$&</span>');
}

// Atualiza o conteúdo das páginas de acordo com a página atual
function atualizarPaginas() {
    const dados = conteudo[paginaAtual];
    const livroAbertoDom = document.querySelector('.livro-aberto');

    livroAbertoDom.classList.remove('contra-capa');

    if (dados.contraCapa) {
        livroAbertoDom.classList.add('contra-capa');
        document.getElementById('titulo-esq').innerText = '';
        document.getElementById('texto-esq').innerText = '';
        document.getElementById('titulo-dir').innerText = '';
        document.getElementById('indicador').innerText = 'Contra-Capa';

        const containerDir = document.getElementById('conteudo-dir');
        containerDir.className = 'centralizado';
        containerDir.innerHTML = `
            <div class="capa-conteudo">
                <span class="detalhe-folha">🌿</span>
                <h1>Fim</h1>
                <p>Agrinho 2026</p>
                <p style="margin-top:12px;"><a id="abrir-introducao-link" href="introducao.html" target="_blank" rel="noopener noreferrer">Abrir Introdução</a></p>
            </div>
        `;
        // Quando o link de introdução for clicado, pausar qualquer som ativo
        setTimeout(() => {
            const link = document.getElementById('abrir-introducao-link');
            if (link) {
                link.addEventListener('click', () => {
                    try { const a1 = document.getElementById('audio-floresta'); if (a1) { a1.pause(); a1.currentTime = 0; } } catch(e){}
                    try { const a2 = document.getElementById('audio-campo'); if (a2) { a2.pause(); a2.currentTime = 0; } } catch(e){}
                });
            }
        }, 0);
    } else {
        document.getElementById('conteudo-dir').className = '';
        document.getElementById('titulo-esq').innerHTML = numerosEmItalico(dados.esq.tit || '');
        document.getElementById('texto-esq').innerText = dados.esq.txt;
        document.getElementById('titulo-dir').innerHTML = numerosEmItalico(dados.dir.tit || '');

        if (dados.fim) {
            document.getElementById('indicador').innerText = 'Fim';
        } else {
            document.getElementById('indicador').innerText =
                `Capítulo ${paginaAtual + 1} de ${TOTAL_CAPITULOS}`;
        }

        const containerDir = document.getElementById('conteudo-dir');
        if (dados.dir.simulador) {
            containerDir.innerHTML = `
                <p>${dados.dir.txt}</p>
                <div class="sim-box">
                    <h3>🌾 Recuperando o Solo 🌾</h3>
                    <div id="solo-visual">Solo árido — 0%</div>
                    <div class="progresso"><div class="progresso-barra" id="barra-progresso"></div></div>
                    <div class="acoes">
                        <button class="btn-acao" data-acao="arar" onclick="fazerAcao(this,'arar')">${t('actions.arar')}</button>
                        <button class="btn-acao" data-acao="plantar" onclick="fazerAcao(this,'plantar')">${t('actions.plantar')}</button>
                        <button class="btn-acao" data-acao="adubar" onclick="fazerAcao(this,'adubar')">${t('actions.adubar')}</button>
                        <button class="btn-acao" data-acao="regar" onclick="fazerAcao(this,'regar')">${t('actions.regar')}</button>
                    </div>
                    <p class="mensagem-final" id="mensagem-final"></p>
                    <button class="btn-nav escondido" id="btn-reiniciar" onclick="reiniciarJogo()" style="margin-top:8px;">${t('jogarDeNovo')}</button>
                </div>
                <p style="margin-top:10px; font-weight:bold; color:#2e7d32; text-align:center;">
                    "Pedro entendeu que herdou mais que uma fazenda — herdou um futuro." 🌱
                </p>
            `;
            reiniciarJogo();
        } else {
            containerDir.innerHTML = `<p>${dados.dir.txt}</p>`;
        }
    }

    const botoes = document.querySelectorAll('#controles .btn-nav');
    if (botoes.length === 2) {
        botoes[0].disabled = (paginaAtual === 0);
        botoes[1].disabled = (paginaAtual === conteudo.length - 1);
        if (paginaAtual === conteudo.length - 2 && !minigameCompleto()) {
            botoes[1].disabled = true;
        }
    }
}

// Processa a ação do minigame e atualiza o progresso
function fazerAcao(btn, acao) {
    const msg = document.getElementById('mensagem-final');
    if (feitas.has(acao)) return;

    if (acao !== ACOES[indiceEsperado]) {
        if (msg) msg.innerText = `${t('acaoIncorreta')} ${t('actions.' + ACOES[indiceEsperado])}`;
        return;
    }

    feitas.add(acao);
    btn.classList.add('feito');
    btn.disabled = true;

    indiceEsperado = Math.min(ACOES.length - 1, indiceEsperado + 1);

    progresso = (feitas.size / ACOES.length) * 100;
    const solo = document.getElementById('solo-visual');
    const barra = document.getElementById('barra-progresso');
    barra.style.width = progresso + '%';

    solo.classList.remove('etapa-1', 'etapa-2', 'etapa-3');
    if (feitas.size === 1) {
        solo.classList.add('etapa-1');
        solo.innerText = `${t('soloEtapa1')} — ${Math.round(progresso)}%`;
    } else if (feitas.size === 2 || feitas.size === 3) {
        solo.classList.add('etapa-2');
        solo.innerText = `${t('soloEtapa2')} — ${Math.round(progresso)}%`;
    } else if (feitas.size === 4) {
        solo.classList.add('etapa-3');
        solo.innerText = t('soloEtapa3');
        if (msg) msg.innerText = t('mensagemFinal');
        const btn = document.getElementById('btn-reiniciar');
        btn.textContent = t('jogarDeNovo');
        btn.classList.remove('escondido');
    }

    atualizarBotoesSequencia();
}

// Reinicia o minigame para jogar novamente
function reiniciarJogo() {
    progresso = 0;
    feitas = new Set();
    indiceEsperado = 0;
    const solo = document.getElementById('solo-visual');
    const barra = document.getElementById('barra-progresso');
    const msg = document.getElementById('mensagem-final');
    if (!solo) return;
    solo.classList.remove('etapa-1', 'etapa-2', 'etapa-3');
    solo.innerText = t('soloInicial');
    barra.style.width = '0%';
    msg.innerText = '';
    document.getElementById('btn-reiniciar').classList.add('escondido');
    document.querySelectorAll('.btn-acao').forEach(b => {
        b.classList.remove('feito');
    });

    atualizarBotoesSequencia();
}

// Controla a visibilidade do botão e das opções de fundo
function toggleOpcoesFundo() {
    const opcoes = document.getElementById('opcoes-fundo');
    const btn = document.getElementById('btn-alterar-fundo');
    if (!opcoes.classList.contains('aberto')) {
        opcoes.classList.add('aberto');
        if (btn) btn.style.display = 'none';
    } else {
        opcoes.classList.remove('aberto');
        if (btn) btn.style.display = 'inline-block';
    }
}

// evitar autoplay de áudio antes de interação do usuário
let audioAllowed = false;
function enableAudioOnce() { audioAllowed = true; document.removeEventListener('click', enableAudioOnce); }
document.addEventListener('click', enableAudioOnce);

// Seleciona o fundo de vídeo e toca o som correspondente
function selecionarFundo(nome) {
    const video = document.getElementById('video-floresta');
    const opcoes = document.querySelectorAll('.opcoes-fundo .opcao');
    const audioFloresta = document.getElementById('audio-floresta');
    const audioCampo = document.getElementById('audio-campo');
    const opcoesContainer = document.getElementById('opcoes-fundo');
    const btn = document.getElementById('btn-alterar-fundo');

    opcoes.forEach(btn => btn.classList.toggle('ativo', btn.dataset.fundo === nome));

    if (nome === 'floresta') {
        video.querySelector('source').src = 'floresta 2.mp4';
        video.load();
        video.style.display = 'block';
        document.body.style.background = '#0e1a0e';
        try {
            audioCampo.pause(); audioCampo.currentTime = 0;
        } catch(e){}
        if (audioAllowed) { audioFloresta.play().catch(()=>{}); }
    } else if (nome === 'campo') {
        video.querySelector('source').src = 'campo 1.mp4';
        video.load();
        video.style.display = 'block';
        document.body.style.background = '#0e1a0e';
        try {
            audioFloresta.pause(); audioFloresta.currentTime = 0;
        } catch(e){}
        if (audioAllowed) { audioCampo.play().catch(()=>{}); }
    }
    if (opcoesContainer) opcoesContainer.classList.remove('aberto');
    if (btn) btn.style.display = 'inline-block';
}

// Seleciona o fundo padrão ao iniciar a página
document.addEventListener('DOMContentLoaded', () => selecionarFundo('floresta'));

document.addEventListener('keydown', (e) => {
    if (!livroAberto) {
        if (e.key === 'Enter' || e.key === ' ') abrirLivro();
        return;
    }
    if (e.key === 'ArrowRight') mudarPagina(1);
    if (e.key === 'ArrowLeft')  mudarPagina(-1);
});
