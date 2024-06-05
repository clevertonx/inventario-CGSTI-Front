document.addEventListener("DOMContentLoaded", function () {
    const equipamentoForm = document.getElementById("equipamentoForm");
    const reservaForm = document.getElementById("reservaForm");

    let deleteType = '';
    let deleteId = null;

    function fetchEquipamentos() {
        axios.get('http://localhost:8080/equipamentos')
            .then(response => {
                const equipamentos = response.data;
                const equipamentoTableBody = document.getElementById("equipamentoTableBody");
                equipamentoTableBody.innerHTML = "";

                equipamentos.forEach(equipamento => {
                    const statusClass = equipamento.statusEquipamento === "DISPONIVEL" ? "bg-success text-white" : "bg-danger text-white";
                    const tooltipContent = `
                    Número de Série: ${equipamento.numeroSerie}
                    Marca: ${equipamento.marca}
                    Modelo: ${equipamento.modelo}
                    HD/SSD: ${equipamento.hdSsd}
                    Processador: ${equipamento.processador}
                    Placa de Vídeo: ${equipamento.placaDeVideo}
                    Memória RAM: ${equipamento.memoriaRam}
                    Sistema Operacional: ${equipamento.sistemaOperacional}
                    Arquitetura: ${equipamento.arquitetura}
                    Endereço MAC: ${equipamento.enderecoMac}
                    Etiqueta: ${equipamento.etiqueta}
                `;
                    const row = `
                <tr>
                <td data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipContent}" class="custom-tooltip" style="cursor: pointer;">${equipamento.nome}</td>
                <td>${equipamento.tipo}</td>
                    <td class="mt-1 status-cell ${statusClass}">${equipamento.statusEquipamento.toLowerCase()}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-primary btn-sm action-button" onclick="editEquipamento(${equipamento.id})"><i class="fa-solid fa-pencil fa-xs"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDelete('equipamento', ${equipamento.id})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
                    equipamentoTableBody.innerHTML += row;
                });

                updateEquipamentoOptions(equipamentos);
            })
            .catch(error => console.error('Erro ao buscar equipamentos:', error.response));
    }

    $(function () {
        $('[data-bs-toggle="tooltip"]').tooltip();
    });


    function fetchReservas() {
        axios.get('http://localhost:8080/reservas')
            .then(response => {
                const reservas = response.data;
                axios.get('http://localhost:8080/equipamentos')
                    .then(equipamentosResponse => {
                        const equipamentosMap = new Map();
                        equipamentosResponse.data.forEach(equipamento => {
                            equipamentosMap.set(equipamento.id, equipamento.nome);
                        });
                        renderizarTabelaReservas(reservas, equipamentosMap);
                    })
                    .catch(error => console.error('Erro ao buscar equipamentos:', error.response));
            })
            .catch(error => console.error('Erro ao buscar reservas:', error.response));
    }

    function fetchHistoricoReservas() {
        axios.get('http://localhost:8080/reservaHistorico')
            .then(response => {
                const historicoReservas = response.data;
                renderizarTabelaHistoricoReservas(historicoReservas);
            })
            .catch(error => console.error('Erro ao buscar histórico de reservas:', error.response));
    }

    function renderizarTabelaHistoricoReservas(historicoReservas) {
        const historicoTableBody = document.getElementById("historicoTableBody");
        historicoTableBody.innerHTML = "";
    
        historicoReservas.forEach(reserva => {
            const dataSolicitacao = new Date(reserva.dataSolicitacao).toLocaleDateString('pt-BR');
            const dataRetirada = new Date(reserva.dataRetirada).toLocaleDateString('pt-BR');
            const dataEntrega = new Date(reserva.dataEntrega).toLocaleDateString('pt-BR');
            const dataDevolucao = new Date(reserva.dataDevolucao).toLocaleDateString('pt-BR');
    
            const row = `
                <tr>
                    <td>${reserva.responsavelSetor}</td>
                    <td>${dataSolicitacao}</td>
                    <td>${reserva.periodo}</td>
                    <td>${reserva.localEvento}</td>
                    <td>${reserva.telefone}</td>
                    <td>${dataRetirada}</td>
                    <td>${dataEntrega}</td>
                    <td>${dataDevolucao}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-danger btn-sm" onclick="confirmDelete('reservaHistorico', ${reserva.id})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            historicoTableBody.innerHTML += row;
        });
    }

    function renderizarTabelaReservas(reservas, equipamentosMap) {
        const reservaTableBody = document.getElementById("reservaTableBody");
        const toastContainer = document.getElementById("toastContainer");
        reservaTableBody.innerHTML = "";
        toastContainer.innerHTML = "";

        const dataAtual = new Date();

        reservas.forEach(reserva => {
            const equipamentosNomes = reserva.equipamentosIds.map(id => equipamentosMap.get(id)).join(", ");
            const dataSolicitacaoFormatada = new Date(reserva.dataSolicitacao).toLocaleDateString('pt-BR');
            const dataRetiradaFormatada = new Date(reserva.dataRetirada).toLocaleDateString('pt-BR');
            const dataEntregaFormatada = new Date(reserva.dataEntrega).toLocaleDateString('pt-BR');
            const dataEntrega = new Date(reserva.dataEntrega);

            const isAtrasado = dataEntrega < dataAtual;

            const linhaClasse = isAtrasado ? 'table-danger' : '';

            const row = `
                <tr class="${linhaClasse}">
                    <td>${reserva.responsavelSetor}</td>
                    <td>${dataSolicitacaoFormatada}</td>
                    <td>${reserva.periodo}</td>
                    <td>${reserva.localEvento}</td>
                    <td>${reserva.telefone}</td>
                    <td>${dataRetiradaFormatada}</td>
                    <td>${dataEntregaFormatada}</td>
                    <td>${equipamentosNomes}</td>
                    <td>
                        <div class="btn-group">
                        <button class="btn btn-success btn-sm action-button" onclick="concluirReserva(${reserva.id})"><i class="fa-solid fa-check"></i></button>
                            <button class="btn btn-primary btn-sm action-button" onclick="editReserva(${reserva.id})"><i class="fa-solid fa-pencil fa-xs"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDelete('reserva', ${reserva.id})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;

            reservaTableBody.innerHTML += row;

            if (isAtrasado) {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.role = 'alert';
                toast.ariaLive = 'assertive';
                toast.ariaAtomic = 'true';
                toast.innerHTML = `
                    <div class="toast-header">
                        <strong class="me-auto">Atraso na Entrega</strong>
                        <small>agora</small>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        A reserva de ${reserva.responsavelSetor} está atrasada! Data de entrega: ${dataEntregaFormatada}.
                    </div>
                `;
                toastContainer.appendChild(toast);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            }

            
        });
    }


    function updateEquipamentoOptions(equipamentos) {
        const equipamentosSelect = document.getElementById("equipamentos");
        equipamentosSelect.innerHTML = "";
        equipamentos.forEach(equipamento => {
            if (equipamento.statusEquipamento === "DISPONIVEL") {
                const option = `<option value="${equipamento.id}">${equipamento.nome}</option>`;
                equipamentosSelect.innerHTML += option;
            }
        });
    }

    equipamentoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const equipamento = {
            nome: document.getElementById("equipamentoNome").value,
            tipo: document.getElementById("equipamentoTipo").value
        };

        if (!equipamento.nome || !equipamento.tipo) {
            console.error('Nome e Tipo são campos obrigatórios.');
            return;
        }

        equipamento.numeroSerie = document.getElementById("equipamentoNumeroSerie").value;
        equipamento.marca = document.getElementById("equipamentoMarca").value;
        equipamento.modelo = document.getElementById("equipamentoModelo").value;
        equipamento.hdSsd = document.getElementById("equipamentoHdSsd").value;
        equipamento.processador = document.getElementById("equipamentoProcessador").value;
        equipamento.placaDeVideo = document.getElementById("equipamentoPlacaDeVideo").value;
        equipamento.memoriaRam = document.getElementById("equipamentoMemoriaRam").value;
        equipamento.sistemaOperacional = document.getElementById("equipamentoSistemaOperacional").value;
        equipamento.arquitetura = document.getElementById("equipamentoArquitetura").value;
        equipamento.enderecoMac = document.getElementById("equipamentoEnderecoMac").value;
        equipamento.etiqueta = document.getElementById("equipamentoEtiqueta").value;

        if (isEditingEquipamento) {
            axios.put(`http://localhost:8080/equipamentos/${editingEquipamentoId}`, equipamento)
                .then(response => {
                    fetchEquipamentos();
                    $("#equipamentoModal").modal('hide');
                    isEditingEquipamento = false;
                    editingEquipamentoId = null;
                })
                .catch(error => console.error('Erro ao atualizar equipamento:', error.response));
        } else {
            axios.post('http://localhost:8080/equipamentos', equipamento)
                .then(response => {
                    fetchEquipamentos();
                    $("#equipamentoModal").modal('hide');
                })
                .catch(error => console.error('Erro ao adicionar equipamento:', error.response));
        }
    });


    reservaForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const reserva = {
            responsavelSetor: document.getElementById("responsavelSetor").value,
            dataSolicitacao: document.getElementById("dataSolicitacao").value,
            dataRetirada: document.getElementById("dataRetirada").value,
            dataEntrega: document.getElementById("dataEntrega").value,
            periodo: document.getElementById("periodo").value,
            localEvento: document.getElementById("localEvento").value,
            telefone: document.getElementById("telefone").value,
            equipamentosIds: Array.from(document.getElementById("equipamentos").selectedOptions).map(option => option.value)
        };

        if (isEditingReserva) {
            axios.put(`http://localhost:8080/reservas/${editingReservaId}`, reserva)
                .then(response => {
                    fetchReservas();
                    fetchEquipamentos();
                    $("#reservaModal").modal('hide');
                    isEditingReserva = false;
                    editingReservaId = null;
                })
                .catch(error => console.error('Erro ao atualizar reserva:', error.response));
        } else {
            axios.post('http://localhost:8080/reservas', reserva)
                .then(response => {
                    fetchReservas();
                    fetchEquipamentos();
                    $("#reservaModal").modal('hide');
                })
                .catch(error => console.error('Erro ao adicionar reserva:', error.response));
        }
    });

    window.confirmDelete = function (type, id) {
        deleteType = type;
        deleteId = id;
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();
    };

    document.getElementById('confirmDeleteButton').addEventListener('click', function () {
        const id = deleteId;
        if (deleteType === 'equipamento') {
            axios.delete(`http://localhost:8080/equipamentos/${id}`)
                .then(response => {
                    fetchEquipamentos();
                })
                .catch(error => console.error('Erro ao excluir equipamento:', error.response));
        } else if (deleteType === 'reserva') {
            axios.delete(`http://localhost:8080/reservas/${id}`)
                .then(response => {
                    fetchReservas();
                    fetchEquipamentos();
                })
                .catch(error => console.error('Erro ao excluir reserva:', error.response));
        } else if (deleteType === 'reservaHistorico') {
            axios.delete(`http://localhost:8080/reservaHistorico/${id}`)
                .then(response => {
                    fetchHistoricoReservas(); 
                })
                .catch(error => console.error('Erro ao excluir reserva do histórico:', error.response));
        }
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        confirmModal.hide();
    });

    let isEditingEquipamento = false;
    let isEditingReserva = false;
    let editingEquipamentoId = null;
    let editingReservaId = null;



    window.editEquipamento = function (id) {
        isEditingEquipamento = true;
        editingEquipamentoId = id;
        axios.get(`http://localhost:8080/equipamentos/${id}`)
            .then(response => {
                const equipamento = response.data;
                document.getElementById("equipamentoNome").value = equipamento.nome;
                document.getElementById("equipamentoTipo").value = equipamento.tipo;
                $("#equipamentoModal").modal('show');
            })
            .catch(error => console.error('Erro ao buscar equipamento:', error.response));
    }

    window.editReserva = function (id) {
        isEditingReserva = true;
        editingReservaId = id;
        axios.get(`http://localhost:8080/reservas/${id}`)
            .then(response => {
                const reserva = response.data;
                document.getElementById("responsavelSetor").value = reserva.responsavelSetor;
                document.getElementById("dataSolicitacao").value = reserva.dataSolicitacao;
                document.getElementById("dataRetirada").value = reserva.dataRetirada;
                document.getElementById("dataEntrega").value = reserva.dataEntrega;
                document.getElementById("periodo").value = reserva.periodo;
                document.getElementById("localEvento").value = reserva.localEvento;
                document.getElementById("telefone").value = reserva.telefone;
                const equipamentosSelect = document.getElementById("equipamentos");
                Array.from(equipamentosSelect.options).forEach(option => {
                    option.selected = reserva.equipamentosIds.includes(parseInt(option.value));
                });
                $("#reservaModal").modal('show');
            })
            .catch(error => console.error('Erro ao buscar reserva:', error.response));
    }

    


    fetchEquipamentos();
    fetchReservas();
    fetchHistoricoReservas();
});


function concluirReserva(id) {
    axios.put(`http://localhost:8080/reservas/concluir/${id}`)
        .then(response => {
            fetchEquipamentos();
            fetchReservas();
            fetchHistoricoReservas();
            console.log('Reserva concluída com sucesso!');
        })
        .catch(error => console.error('Erro ao concluir reserva:', error.response));
}
