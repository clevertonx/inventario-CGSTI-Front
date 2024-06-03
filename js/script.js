document.addEventListener("DOMContentLoaded", function () {
    const equipamentoForm = document.getElementById("equipamentoForm");
    const reservaForm = document.getElementById("reservaForm");

    function fetchEquipamentos() {
        axios.get('http://localhost:8080/equipamentos')
            .then(response => {
                const equipamentos = response.data;
                const equipamentoTableBody = document.getElementById("equipamentoTableBody");
                equipamentoTableBody.innerHTML = "";

                equipamentos.forEach(equipamento => {
                    const statusClass = equipamento.statusEquipamento === "DISPONIVEL" ? "bg-success text-white" : "bg-danger text-white";
                    const row = `
                    <tr>
                        <td>${equipamento.nome}</td>
                        <td>${equipamento.tipo}</td>
                        <td class="status-cell ${statusClass}">${equipamento.statusEquipamento.toLowerCase()}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipamento(${equipamento.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                
                    equipamentoTableBody.innerHTML += row;
                });

                updateEquipamentoOptions(equipamentos);
            })
            .catch(error => console.error('Erro ao buscar equipamentos:', error.response));
    }

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


function renderizarTabelaReservas(reservas, equipamentosMap) {
    const reservaTableBody = document.getElementById("reservaTableBody");
    reservaTableBody.innerHTML = "";

    reservas.forEach(reserva => {
        const equipamentosNomes = reserva.equipamentosIds.map(id => equipamentosMap.get(id)).join(", ");

        const row = `
            <tr>
                <td>${reserva.responsavelSetor}</td>
                <td>${reserva.dataSolicitacao}</td>
                <td>${reserva.periodo}</td>
                <td>${reserva.localEvento}</td>
                <td>${reserva.telefone}</td>
                <td>${reserva.dataRetirada}</td>
                <td>${reserva.dataEntrega}</td>
                <td>${equipamentosNomes}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteReserva(${reserva.id})">Excluir</button>
                </td>
            </tr>
        `;

        reservaTableBody.innerHTML += row;
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

        const novoEquipamento = {
            nome: document.getElementById("equipamentoNome").value,
            tipo: document.getElementById("equipamentoTipo").value
        };

        axios.post('http://localhost:8080/equipamentos', novoEquipamento)
            .then(response => {
                fetchEquipamentos();
                $("#equipamentoModal").modal('hide');
            })
            .catch(error => console.error('Erro ao adicionar equipamento:', error.response));
    });

    reservaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const novaReserva = {
            responsavelSetor: document.getElementById("responsavelSetor").value,
            dataSolicitacao: document.getElementById("dataSolicitacao").value,
            dataRetirada: document.getElementById("dataRetirada").value,
            dataEntrega: document.getElementById("dataEntrega").value,
            periodo: document.getElementById("periodo").value,
            localEvento: document.getElementById("localEvento").value,
            telefone: document.getElementById("telefone").value,
            equipamentosIds: Array.from(document.getElementById("equipamentos").selectedOptions).map(option => option.value)
        };

        axios.post('http://localhost:8080/reservas', novaReserva)
            .then(response => {
                fetchReservas();
                fetchEquipamentos();
                $("#reservaModal").modal('hide');
            })
            .catch(error => console.error('Erro ao adicionar reserva:', error.response));
    });

    window.deleteEquipamento = function (id) {
        if (confirm("Tem certeza que deseja excluir este equipamento?")) {
            axios.delete(`http://localhost:8080/equipamentos/${id}`)
                .then(response => {
                    fetchEquipamentos();
                })
                .catch(error => console.error('Erro ao excluir equipamento:', error.response));
        }
    };

    window.deleteReserva = function (id) {
        if (confirm("Tem certeza que deseja excluir esta reserva?")) {
            axios.delete(`http://localhost:8080/reservas/${id}`)
                .then(response => {
                    fetchReservas();
                    fetchEquipamentos();
                })
                .catch(error => console.error('Erro ao excluir reserva:', error.response));
        }
    };

    fetchEquipamentos();
    fetchReservas();
});
